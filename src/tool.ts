/**
 * Hide the loading indicator once the app is fully loaded
 */
export function hideAppLoadingIndicator() {
  const indicator = document.getElementById('jupyterlite-loading-indicator');
  if (indicator) {
    indicator.classList.add('hidden');
    indicator.addEventListener(
      'animationend',
      () => {
        indicator.remove();
        // Remove theme classes after the loading indicator is removed
        document.body.classList.remove('jp-mod-dark', 'jp-mod-light');
      },
      { once: true }
    );
  }
}
