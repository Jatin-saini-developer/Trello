
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