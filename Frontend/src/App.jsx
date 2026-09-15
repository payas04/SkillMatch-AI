import { RouterProvider } from "react-router";
import router from "./routes";
import useAuthStore from "./store/authStore";
import { useEffect } from "react";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-neutral-950">
      {/* Hardware-accelerated fixed background on its own GPU layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat pointer-events-none"
      />
      {/* Scrollable foreground content */}
      <div className="relative z-10 min-h-screen w-full">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
