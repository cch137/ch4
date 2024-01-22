'use client'
import { Button } from "@nextui-org/button"
import Link from "next/link"
import { useParams } from "next/navigation"

const UsersPage = () => {
  const params = useParams()
  return (
    <div>
      <h1>User: {params.uid}</h1>
      <div>
        <Link href="/">
          <Button
            href="/"
            color="primary"
            className="font-semibold pointer-events-none"
            variant="shadow"
          >
            Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default UsersPage