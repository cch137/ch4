import { CONTENT_MAX_W } from "@/constants/asst";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import Link from "next/link";

export default function AiAsst() {
  return (
    <div className="max-w-full px-4 py-8 m-auto" style={{width: CONTENT_MAX_W}}>
      <Spacer y={16} />
      <h1 className="text-4xl text-default-600 text-center font-medium">Coming Soon</h1>
      <Spacer y={8} />
      <div className="flex-center">
        <Button as={Link} href="/">Back to Home</Button>
      </div>
      {/* <h1 className="text-3xl font-medium">AI Assistant Trigger</h1>
      <Spacer y={4} />
      <h2 className="text-xl font-medium">My Trigger</h2> */}
    </div>
  )
}
