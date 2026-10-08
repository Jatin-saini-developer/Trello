// Shared by the login and signup pages: sample cards for the animated board
export const AV = { P: '#D97757', A: '#6FB38E', M: '#9C8FE0', J: '#E9A23B' }
// title, label colors, checklist, due, members
const CARDS = [
  ['Review pull requests', ['#D97757', '#9C8FE0'], '3/5', 'Fri', 'PA'],
  ['Write release notes', ['#6FB38E'], '1/4', 'Mon', 'M'],
  ['Plan the sprint', ['#E9A23B', '#D97757'], '0/6', 'Tue', 'JP'],
  ['Reply to Priya', ['#9C8FE0'], '', 'Today', 'A'],
  ['Update the roadmap', ['#6FB38E', '#E9A23B'], '2/3', 'Thu', 'PM'],
  ['Book the offsite', ['#D97757'], '', 'Next week', 'J'],
  ['Fix the login bug', ['#D97757'], '4/6', 'Today', 'AJ'],
  ['Design the pricing page', ['#9C8FE0', '#6FB38E'], '2/5', 'Wed', 'MP'],
  ['Ship version one', ['#6FB38E'], '8/8', '', 'PAM'],
  ['Set up the CI pipeline', ['#E9A23B'], '5/5', '', 'J'],
  ['Onboard the team', ['#9C8FE0'], '3/3', '', 'AM'],
]
export const LANES = ['To do', 'Doing', 'Done']

const Card = ({ id }) => {
  const [t, cs, ck, due, who] = CARDS[id]
  return (
    <article className="kc" data-flip-id={id}>
      <div className="lb">{cs.map((c) => <i key={c} style={{ background: c }} />)}</div>
      <h3>{t}</h3>
      <div className="mt">
        <span>{ck && <em>{ck}</em>}{due && <em>Due {due}</em>}</span>
        <span className="avs">{who.split('').map((w) => <i className="av" key={w} style={{ background: AV[w] }}>{w}</i>)}</span>
      </div>
    </article>
  )
}

export default Card