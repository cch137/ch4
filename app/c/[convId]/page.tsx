'use client'
import { Button } from "@nextui-org/button"
import Link from "next/link"
import { useParams } from "next/navigation"

const UsersPage = () => {
  const params = useParams()
  return (
    <div>
      <h1>Conv: {params.convId}</h1>
      <div>
        <Button
          as={Link}
          href="/"
          color="primary"
          className="font-semibold"
          variant="shadow"
        >
          Home
        </Button>
      </div>
    </div>
  )
}

export default UsersPage