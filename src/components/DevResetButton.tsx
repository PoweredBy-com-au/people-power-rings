export default function DevResetButton() {
  const reset = () => {
    localStorage.removeItem("scf_onboarding_complete_v3");
    localStorage.removeItem("training_insights_unlocked_v3");
    window.location.reload();
  };
  return (
    <button
      onClick={reset}
      className="fixed bottom-3 right-3 z-[9999] px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 backdrop-blur"
      title="Dev: restart onboarding"
    >
      ↺ Restart onboarding
    </button>
  );
}
