import { AppRoutes } from "@/routes";
import { useAuth } from "@/hooks/useAuth";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#0b0c10]">
    <div className="flex flex-col items-center gap-4">
      {/* Spinning Loader */}
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-orange-500 text-xs font-bold">FF</span>
        </div>
      </div>
      <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
        Loading FoodFlow...
      </p>
    </div>
  </div>
);

const App = () => {
  const { ready } = useAuth();
  if (!ready) {
    return <PageLoader />;
  }
  return <AppRoutes />;
};

export default App;
