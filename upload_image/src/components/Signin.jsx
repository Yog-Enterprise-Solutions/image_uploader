import React from "react";

function Signin({
  handleLogin,
  isLoggedIn,
  username,
  setUsername,
  setPassword,
  password,
}) {
  return (
    <div
      id="login"
      style={{
        backgroundColor: "#f8f9fa",
        display: isLoggedIn ? "none" : "block",
      }}
      className="login"
    >
      <div
        id="login"
        style={{
          backgroundColor: "#f8f9fa",
          display: "block",
        }}
        className="login"
      >
        <div
          className="Contaner"
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <main
            className="form-signin"
            style={{
              maxWidth: "400px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <form>
              <h1 className="h3 mb-3 fw-normal text-center">Please sign in</h1>

              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInput"
                  placeholder="name@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ borderRadius: "10px" }}
                />
                <label htmlFor="floatingInput">Email address</label>
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: "10px" }}
                />
                <label htmlFor="floatingPassword">Password</label>
              </div>
              <button
                className="btn btn-primary w-100 py-2"
                type="button"
                onClick={handleLogin}
                style={{ borderRadius: "10px" }}
              >
                Sign in
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Signin;
