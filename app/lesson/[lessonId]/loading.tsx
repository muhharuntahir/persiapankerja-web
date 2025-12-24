export default function LoadingLesson() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-sky-500 border-t-transparent mx-auto" />
        <p className="text-sm text-neutral-500">Menyiapkan latihan…</p>
      </div>
    </div>
  );
}
