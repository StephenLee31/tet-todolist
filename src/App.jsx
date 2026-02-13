import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tet_packing_todolist_v4";

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

const defaultCategories = [
  { id: "clothes", title: "👕 Quần áo", items: [] },
  { id: "personal", title: "🧴 Đồ cá nhân", items: [] },
  { id: "work", title: "💻 Đồ công việc", items: [] },
  { id: "gifts", title: "🎁 Quà Tết", items: [] },
];

export default function TetPackingTodo() {
  const [categories, setCategories] = useState(() => load() || defaultCategories);
  const [newItem, setNewItem] = useState("");
  const [activeCat, setActiveCat] = useState("clothes");
  const [editing, setEditing] = useState(null);

  useEffect(() => save(categories), [categories]);

  const progress = useMemo(() => {
    const all = categories.flatMap((c) => c.items);
    const done = all.filter((i) => i.done).length;
    return all.length ? Math.round((done / all.length) * 100) : 0;
  }, [categories]);

  const toggle = (catId, itemId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done } : i
              ),
            }
          : c
      )
    );
  };

  const removeItem = (catId, itemId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
  };

  const addOrEditItem = () => {
    if (!newItem.trim()) return;

    if (editing) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editing.catId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === editing.itemId
                    ? { ...i, text: newItem.trim() }
                    : i
                ),
              }
            : c
        )
      );
      setEditing(null);
    } else {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === activeCat
            ? {
                ...c,
                items: [
                  ...c.items,
                  { id: crypto.randomUUID(), text: newItem.trim(), done: false },
                ],
              }
            : c
        )
      );
    }

    setNewItem("");
  };

  const startEdit = (catId, item) => {
    setEditing({ catId, itemId: item.id });
    setNewItem(item.text);
  };

  const activeCategory = categories.find((c) => c.id === activeCat);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🧳 Checklist soạn đồ về quê ăn Tết</h1>

        <div style={styles.progressBarWrap}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        </div>
        <p style={styles.progressText}>Tiến độ: {progress}%</p>

        <div style={styles.tabs}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              style={{
                ...styles.tab,
                ...(activeCat === c.id ? styles.tabActive : {}),
              }}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            placeholder={editing ? "Chỉnh sửa món đồ..." : "Thêm đồ cần mang..."}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOrEditItem()}
            style={styles.input}
          />
          <button onClick={addOrEditItem} style={styles.addBtn}>
            {editing ? "Lưu" : "Thêm"}
          </button>
        </div>

        <div style={styles.card}>
          {activeCategory?.items.length === 0 && (
            <p style={{ textAlign: "center", opacity: 0.6 }}>Chưa có món nào ✨</p>
          )}

          {activeCategory?.items.map((item) => (
            <div key={item.id} style={styles.itemRow}>
              <div style={styles.itemLeft}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(activeCategory.id, item.id)}
                />
                <span
                  style={{
                    ...styles.itemText,
                    ...(item.done ? styles.itemDone : {}),
                  }}
                >
                  {item.text}
                </span>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={() => startEdit(activeCategory.id, item)}
                  style={styles.editBtn}
                >
                  Sửa
                </button>
                <button
                  onClick={() => removeItem(activeCategory.id, item.id)}
                  style={styles.deleteBtn}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#fff7ed,#ffedd5,#fef3c7)",
    padding: 16,
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: 520,          // quan trọng: nhỏ lại cho mobile
    background: "white",
    borderRadius: 16,
    padding: 16,            // giảm padding
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  title: {
    fontSize: 24,           // nhỏ lại cho mobile
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 12,
  },

  progressBarWrap: {
    width: "100%",
    height: 12,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg,#fb923c,#f43f5e)",
  },

  progressText: {
    textAlign: "center",
    fontWeight: 600,
    marginTop: 8,
    fontSize: 14,
  },

  tabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    margin: "14px 0",
  },

  tab: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },

  tabActive: {
    background: "#111827",
    color: "white",
  },

  inputRow: {
    display: "flex",
    gap: 8,
    marginBottom: 14,
    width: "100%",
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    minWidth: 0,          // 🔥 fix tràn input trên mobile
  },

  addBtn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    whiteSpace: "nowrap", // 🔥 không cho chữ xuống dòng
  },

  card: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 14,
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
    gap: 8,
  },

  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  itemText: {
    fontSize: 16,
    wordBreak: "break-word", // 🔥 text dài không phá layout
  },

  itemDone: {
    textDecoration: "line-through",
    opacity: 0.5,
  },

  actions: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },

  editBtn: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
  },

  deleteBtn: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #f87171",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
    fontSize: 12,
  },
};
