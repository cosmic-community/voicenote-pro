import Dashboard from '@/components/Dashboard'
import { getNotes, getCollections, getTags } from '@/lib/cosmic'

export default async function HomePage() {
  const [notes, collections, tags] = await Promise.all([
    getNotes(),
    getCollections(),
    getTags(),
  ])

  return (
    <Dashboard 
      initialNotes={notes}
      collections={collections}
      tags={tags}
    />
  )
}