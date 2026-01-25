/**
 * FOUC（Flash of Unstyled Content）対策用のインラインスクリプト
 * HTMLパース時に即座に実行され、DOMContentLoaded前にテーマを設定する
 */
export function ThemeScript() {
  const script = `
(function() {
  var path = window.location.pathname;
  var theme = 'investment';
  if (path.startsWith('/tech')) {
    theme = 'programming';
  } else if (path.startsWith('/health')) {
    theme = 'health';
  } else if (path.startsWith('/asset')) {
    theme = 'investment';
  }
  document.body.setAttribute('data-theme', theme);
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
