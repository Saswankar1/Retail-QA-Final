import "./App.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import spinner from "./assets/spinner.svg";
import msgIcon from "./assets/message.svg";
import sendBtn from "./assets/send.svg";
import userIcon from "./assets/user-icon.png";
import deleteIcon from "./assets/delete.svg";
import Login from "./Login";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function detectChartType(question) {
  const q = question.toLowerCase();
  if (q.includes("pie chart")) return "Pie";
  if (q.includes("bar chart")) return "Bar";
  if (q.includes("line chart")) return "Line";
  if (q.includes("area chart")) return "Area";
  return null;
}

function App() {
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [[]];
  });
  const [titles, setTitles] = useState(() => {
    const saved = localStorage.getItem("titles");
    return saved ? JSON.parse(saved) : ["New Chat"];
  });
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const chatEndRef = useRef(null);
  const chartColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("titles", JSON.stringify(titles));
  }, [chats, titles]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, isLoading]);

  const handleSend = async () => {
    if (!question.trim()) return;
    const chart = detectChartType(question);

    setChats((prev) => {
      const upd = [...prev];
      upd[activeChatIndex] = [
        ...upd[activeChatIndex],
        { type: "user", text: question, animate: true },
      ];
      return upd;
    });

    if (chats[activeChatIndex].length === 0) {
      setTitles((prev) => {
        const upd = [...prev];
        upd[activeChatIndex] =
          question.length > 25 ? question.slice(0, 25) + "..." : question;
        return upd;
      });
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post("http://127.0.0.1:8000/query", {
        question,
      });
      const { sql_query, result, columns, is_plotable, chart_insight } = data;

      let finalCols = columns;
      if (!finalCols || finalCols.length === 0) {
        finalCols =
          Array.isArray(result) && result.length ? Object.keys(result[0]) : [];
      }

      setChats((prev) => {
        const upd = [...prev];
        upd[activeChatIndex] = [
          ...upd[activeChatIndex],
          {
            type: "bot",
            sql: sql_query,
            columns: finalCols,
            result,
            is_plotable: !!is_plotable,
            chartType: chart,
            chartInsight: chart_insight,
            xAxis: "",
            yAxis: "",
            animate: true,
          },
        ];
        return upd;
      });
    } catch (err) {
      setChats((prev) => {
        const upd = [...prev];
        upd[activeChatIndex] = [
          ...upd[activeChatIndex],
          { type: "bot", text: `⚠️ Error: ${err.message}`, animate: true },
        ];
        return upd;
      });
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  const handleAxisChange = (idx, axis, value) => {
    setChats((prev) => {
      const upd = [...prev];
      upd[activeChatIndex][idx] = {
        ...upd[activeChatIndex][idx],
        [axis]: value,
      };
      return upd;
    });
  };

  const handleNewChat = () => {
    setChats((prev) => [...prev, []]);
    setTitles((prev) => [...prev, "New Chat"]);
    setActiveChatIndex(chats.length);
    setQuestion("");
  };

  const handleDownloadExcel = (resultData, columns) => {
    const wsData = [
      columns,
      ...resultData.map((r) => columns.map((c) => r[c])),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "query_results.xlsx");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleDeleteChat = (index) => {
    setChatToDelete(index);
    setShowConfirmPopup(true);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete === null) return;

    setChats((prev) => prev.filter((_, i) => i !== chatToDelete));
    setTitles((prev) => prev.filter((_, i) => i !== chatToDelete));

    if (activeChatIndex === chatToDelete) {
      setActiveChatIndex(0);
    } else if (activeChatIndex > chatToDelete) {
      setActiveChatIndex((prev) => prev - 1);
    }

    setShowConfirmPopup(false);
    setChatToDelete(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="logo">
            <span className="brand">🗄️ Retail Q&A Tool</span>
          </div>

          <button className="midBtn" onClick={handleNewChat}>
            <div className="addBtn">+</div>New Chat
          </button>

          <div className="chatList">
            {chats.map((_, i) => (
              <div key={i} className="chatItem">
                <button
                  className={`queries ${i === activeChatIndex ? "active" : ""}`}
                  onClick={() => setActiveChatIndex(i)}
                >
                  <img src={msgIcon} alt="" />
                  {titles[i] || `Chat ${i + 1}`}
                </button>
                <button
                  className="deleteBtn"
                  onClick={() => handleDeleteChat(i)}
                >
                  <img src={deleteIcon} alt="Delete" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="topBar">
          <button className="logoutBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="chats">
          {chats[activeChatIndex]?.map((chat, idx) => (
            <div
              key={idx}
              className={`chat ${chat.type === "bot" ? "bot" : ""} ${
                chat.animate ? "slide-in" : ""
              }`}
            >
              {chat.type === "user" && (
                <img className="chatImg" src={userIcon} alt="" />
              )}
              {chat.type === "bot" && chat.sql ? (
                <div className="botResponse">
                  <h3>📝 Generated SQL Query:</h3>
                  <pre className="sql">{chat.sql}</pre>

                  <h3>📊 Query Results:</h3>
                  {isLoading ? (
                    <div className="skeleton-table" />
                  ) : (
                    <table className="resultTable">
                      <thead>
                        <tr>
                          {chat.columns.map((c, i) => (
                            <th key={i}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chat.result.map((row, i) => (
                          <tr key={i}>
                            {chat.columns.map((c, j) => (
                              <td key={j}>{row[c]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <button
                    className="downloadBtn"
                    onClick={() =>
                      handleDownloadExcel(chat.result, chat.columns)
                    }
                    style={{ float: "right", margin: "1rem 0" }}
                  >
                    Download Excel
                  </button>

                  {chat.is_plotable &&
                    chat.chartType &&
                    chat.columns.length >= 2 && (
                      <div className="chartWrapper">
                        <h3>📈 {chat.chartType} Chart</h3>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            marginBottom: 10,
                            alignItems: "center",
                          }}
                        >
                          {["Pie", "Bar", "Line", "Area"].includes(
                            chat.chartType
                          ) && (
                            <>
                              <label>
                                X-axis:
                                <select
                                  value={chat.xAxis}
                                  onChange={(e) =>
                                    handleAxisChange(
                                      idx,
                                      "xAxis",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {chat.columns.map((c, i) => (
                                    <option key={i} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Y-axis:
                                <select
                                  value={chat.yAxis}
                                  onChange={(e) =>
                                    handleAxisChange(
                                      idx,
                                      "yAxis",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {chat.columns.map((c, i) => (
                                    <option key={i} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </>
                          )}
                        </div>

                        {isLoading ? (
                          <div className="skeleton-chart" />
                        ) : (
                          chat.xAxis &&
                          chat.yAxis && (
                            <>
                              <ResponsiveContainer width="100%" height={300}>
                                {chat.chartType === "Bar" && (
                                  <BarChart data={chat.result}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey={chat.xAxis} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                      dataKey={chat.yAxis}
                                      fill={chartColors[0]}
                                    />
                                  </BarChart>
                                )}
                                {chat.chartType === "Line" && (
                                  <LineChart data={chat.result}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey={chat.xAxis} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                      type="monotone"
                                      dataKey={chat.yAxis}
                                      stroke={chartColors[0]}
                                      strokeWidth={2}
                                    />
                                  </LineChart>
                                )}
                                {chat.chartType === "Area" && (
                                  <AreaChart data={chat.result}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey={chat.xAxis} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                      type="monotone"
                                      dataKey={chat.yAxis}
                                      stroke={chartColors[0]}
                                      fill={chartColors[1]}
                                    />
                                  </AreaChart>
                                )}
                                {chat.chartType === "Pie" && (
                                  <PieChart>
                                    <Tooltip />
                                    <Legend />
                                    <Pie
                                      data={chat.result}
                                      dataKey={chat.yAxis}
                                      nameKey={chat.xAxis}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={100}
                                      fill={chartColors[0]}
                                      label
                                    >
                                      {chat.result.map((entry, i) => (
                                        <Cell
                                          key={i}
                                          fill={
                                            chartColors[i % chartColors.length]
                                          }
                                        />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                )}
                              </ResponsiveContainer>

                              <div
                                style={{
                                  marginTop: "1rem",
                                  padding: "0.5rem",
                                }}
                              >
                                <h4>🔍 Chart Insight:</h4>
                                {chat.chartInsight ? (
                                  <ul style={{ paddingLeft: "1.2rem" }}>
                                    {chat.chartInsight
                                      .split("\n")
                                      .map((line, index) => (
                                        <li
                                          key={index}
                                          style={{ marginBottom: "0.5rem" }}
                                        >
                                          {line}
                                        </li>
                                      ))}
                                  </ul>
                                ) : (
                                  <p>No insight available.</p>
                                )}
                              </div>
                            </>
                          )
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <p className="txt" style={{ whiteSpace: "pre-wrap" }}>
                  {chat.text}
                </p>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="chat bot slide-in">
              <img className="chatImg" src={spinner} alt="Loading..." />
              <p className="txt">Thinking...</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chatFooter">
          <div className="inp">
            <input
              placeholder="Type your Question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send" onClick={handleSend}>
              <img src={sendBtn} alt="Send" />
            </button>
          </div>
        </div>
      </div>


      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Are you sure you want to delete this chat?</h3>
            <div className="popup-buttons">
              <button onClick={confirmDeleteChat} className="confirmBtn">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="cancelBtn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
