import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'


import './App.css'
import SignUp from './pages/SignUp';
import LoginPage from './pages/LoginPage';
import CreateOrgPage from './pages/CreateOrgPage';

function App() {

  const [issues, setIssues] = useState([]);
  const [ws, setWs] = useState();

  const [todoInput, setTodoInput] = useState("");
  const [inProgressInput, setInProgressInput] = useState("");
  const [doneInput, setDoneInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3005");
    setWs(ws);

    ws.onmessage = (ev) => {
      const data = ev.data;
      const parsedData = JSON.parse(data);

      if (parsedData.type == "initial_state") {
        setIssues(parsedData.issues)
      }

      if (parsedData.type == "issue_added") {
        setIssues(i => [...i, parsedData.issue])
      }

      if (parsedData.type == "delete_issue") {
        setIssues(issues => issues.filter(x => x.id != parsedData.issueId))
      }

    }

  }, [])
  return (

    <>
      <Routes>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/create-org' element={<CreateOrgPage/>}/>


      </Routes>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          Todo
          <input type="text" placeholder='issue title' value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
          <button onClick={() => {
            ws.send(JSON.stringify({
              type: "issue_added",
              title: todoInput,
              section: "todo"
            }))
          }}> Add Issues

          </button>
          {issues.filter(i => i.section == "todo").map(issue => <Card key={issue.id} ws={ws} id={issue.id} title={issue.title} />)}

        </div>

        <div style={{ flex: 1 }} >
          In Progress
          <input type="text" placeholder='issue title' value={inProgressInput} onChange={(e) => setInProgressInput(e.target.value)} />
          <button onClick={() => {
            ws.send(JSON.stringify({
              type: "issue_added",
              title: inProgressInput,
              section: "in_progress"
            }))

          }}>Add issue</button>
          {issues.filter(i => i.section == "progress").map(issue => <Card key={issue.id} ws={ws} id={issue.id} title={issue.title} />)}

        </div>
        <div style={{ flex: 1 }}>
          Done
          <input type="text" placeholder='issue title' value={doneInput} onChange={(e) => setDoneInput(e.target.value)} />
          <button onClick={() => {
            ws.send(JSON.stringify({
              type: "issue_added",
              title: doneInput,
              section: "done"
            }))
          }}> Add Issues

          </button>
          {issues.filter(i => i.section == "done").map(issue => <Card key={issue.id} ws={ws} id={issue.id} title={issue.title} />)}

        </div>
      </div>
    </>
  )
}


function Card({ ws, id, title }) {
  return <div style={{ border: "1px solid black", padding: 20, margin: 20 }}>
    {title}
    <button onClick={() => {
      ws.send(JSON.stringify({
        type: "delete_issue",
        issueId: id
      }))
    }} >Delete</button>
  </div>
}

export default App
