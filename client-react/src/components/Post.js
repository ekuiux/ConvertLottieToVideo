import React from "react";

const Post = ({ title, body }) => {
  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", margin: "10px", borderRadius: "5px" }}>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
};

export default Post;
