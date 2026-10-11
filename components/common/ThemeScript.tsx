import { themeScript } from '@/lib/theme';

// Must render before page content to avoid a flash of the wrong theme.
const ThemeScript = () => (
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
);

export default ThemeScript;
