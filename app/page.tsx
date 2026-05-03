import { redirect } from 'next/navigation'

// Root redirects to the portal — middleware also handles this
export default function RootPage() {
  redirect('/portal')
}
