"use client"

import { Button } from "@nextui-org/button";
import { createRef, useRef, useState } from "react";
import { IoArrowUpCircleOutline, IoChevronBack, IoShuffle } from 'react-icons/io5';
import { Spacer } from '@nextui-org/spacer';
import { Input } from '@nextui-org/input';
import Link from 'next/link';
import { readStream } from '@cch137/utils/stream';
import formatBytes from '@cch137/utils/format/format-bytes';

export default function Laundry() {
  const [files, setFiles] = useState<{name: string, size: number, buffer: Uint8Array}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filename, setFilename] = useState('');
  const taskId = useRef('');
  const lastConvertedAt = useRef(0);
  const filesInputRef = createRef<HTMLInputElement>();

  const origin = 'https://api.cch137.link';

  const loadFiles = async () => {
    setFiles([]);
    const inputEl = filesInputRef.current;
    if (!inputEl) return;
    const {files} = inputEl;
    if (!files) return;
    setIsLoading(true);
    lastConvertedAt.current = 0;
    setMessage('preparing...');
    try {
      for (const f of files) {
        const buffer = await readStream(f.stream());
        setFiles(_f => [..._f, {
          name: f.name,
          size: f.size,
          buffer
        }]);
      }
    } catch {
      setMessage('failed to read files!');
    }
    setIsLoading(false);
    setMessage('ready!');
  }

  const convertFiles = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (Date.now() - lastConvertedAt.current > 10 * 60000) {
        setMessage('creating task...');
        taskId.current = (await (await fetch(`${origin}/images-to-pdf/create-task`, {method: 'POST'})).json())?.id;
        if (typeof taskId.current !== 'string') throw new Error('Failed to create task');
        setMessage(`created task: ${taskId.current}`);
        let done = 0;
        const {length} = files;
        await Promise.all(files.map(async ({buffer}, i) => {
          await fetch(`${origin}/images-to-pdf/upload/${taskId.current}/${i}`, {
            method: 'POST',
            body: buffer,
            headers: {'Content-Type': 'application/uint8array'}
          });
          setMessage(`uploaded: ${++done} / ${length}`);
        }));
      }
      const _filename = `${filename || `${Date.now()}.pdf`}`;
      setMessage('converting...');
      const res = await fetch(`${origin}/images-to-pdf/convert/${taskId.current}/${_filename}`, {method: 'POST'});
      if (!res.body) return;
      const pdf = await readStream(res.body);
      lastConvertedAt.current = Date.now();
      setMessage(`converted: ${_filename}`);
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = _filename;
      a.target = '_blank';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      setMessage('something went wrong!');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl m-auto py-8 px-4">
      <div className="flex-center">
        <div className="flex-1">
          <Button isIconOnly as={Link} href="/apps/ncu" variant="light">
            <IoChevronBack className="text-lg" />
          </Button>
        </div>
        <h1 className="flex-4 text-3xl text-default-600 font-bold">
          Images to PDF
        </h1>
        <div className="flex-1" />
      </div>
      <Spacer y={8} />
      <div className="flex-center gap-4">
        <Input
          type="text"
          variant="underlined"
          size="sm"
          label="Filename"
          autoFocus
          isDisabled={isLoading}
          onChange={(e) => setFilename(e.target.value.trim())}
        />
        <input onChange={loadFiles} ref={filesInputRef} type="file" multiple accept="image/*" className="hidden" />
        <div className="flex-center">
          <Button
            onClick={() => filesInputRef.current!.click()}
            variant="flat"
            isDisabled={isLoading}
            startContent={<IoArrowUpCircleOutline className="text-xl" />}
          >
            Upload
          </Button>
        </div>
      </div>
      <div className="flex-center py-4 text-default-300">
        {message}
      </div>
      {files.length === 0 ? null : <div className="flex-center py-4">
        <Button
          onClick={convertFiles}
          color="primary"
          isDisabled={isLoading}
          startContent={<IoShuffle className="text-xl" />}
        >
          Convert
        </Button>
      </div>}
      <div className="flex items-end justify-center">
        <h2 className="flex-1 text-2xl text-default-600">Files</h2>
        <div className="text-sm text-default-300 font-bold">total: {files.length}</div>
      </div>
      <div className="flex flex-col py-4">
        {files.map(({name, size}, i) => (
          <div key={i} className="flex-center text-default-500">
            <div className="flex-1 break-all">{name}</div>
            <div className="text-sm text-default-300">{formatBytes(size).replace(/\s*/g, '')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
