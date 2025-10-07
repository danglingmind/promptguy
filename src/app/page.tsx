import { Feed } from '@/components/Feed'
import { UsernameCheck } from '@/components/UsernameCheck'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UsernameCheck>
        <Feed />
      </UsernameCheck>
    </div>
  )
}
