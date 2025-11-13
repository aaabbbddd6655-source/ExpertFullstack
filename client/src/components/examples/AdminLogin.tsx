import AdminLogin from "../AdminLogin";

export default function AdminLoginExample() {
  return (
    <AdminLogin
      onLogin={(email, password) => {
        console.log("Admin login:", { email, password });
      }}
    />
  );
}
