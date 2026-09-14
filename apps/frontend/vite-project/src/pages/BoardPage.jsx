import { useParams } from 'react-router-dom'

/**
 * BoardPage — placeholder page for /org/:orgId/board/:boardId
 * Will be fully built out later.
 */
function BoardPage() {
  const { orgId, boardId } = useParams()

  return (
    <div>
      <p>Org: {orgId}</p>
      <p>Board: {boardId}</p>
    </div>
  )
}

export default BoardPage
