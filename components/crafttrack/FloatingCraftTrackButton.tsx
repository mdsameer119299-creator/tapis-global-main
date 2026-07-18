type Props = {
  onClick: () => void
}

export default function FloatingCraftTrackButton({ onClick }: Props) {
  return (
    <button
      type="button"
      id="ct-float"
      className="ct-float-btn"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label="Open CraftTrack — track your handcrafted order"
    >
      <span className="ct-float-label">✨ CraftTrack™</span>
    </button>
  )
}
