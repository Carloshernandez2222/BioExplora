export async function celebrate() {
  try {
    const { default: confetti } = await import('canvas-confetti');
    const colors = ['#2ECC71', '#1ABC9C', '#F5A623', '#FCD116', '#003893', '#CE1126'];
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors, disableForReducedMotion: true, zIndex: 90 });
    setTimeout(
      () =>
        confetti({
          particleCount: 90,
          spread: 120,
          origin: { y: 0.5 },
          colors,
          disableForReducedMotion: true,
          zIndex: 90,
        }),
      350,
    );
  } catch {
    /* la celebración es opcional */
  }
}
