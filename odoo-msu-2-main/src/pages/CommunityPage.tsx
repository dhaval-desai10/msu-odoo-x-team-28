import { useParams } from 'react-router-dom'
import { CommunityDashboard } from '../components/CommunityDashboard'

export function CommunityPage() {
  const { id } = useParams()

  if (!id) return <div>Community not found</div>

  return <CommunityDashboard communityId={id} />
} 