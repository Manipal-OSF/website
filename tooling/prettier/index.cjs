module.exports = {
  plugins: [
    require.resolve('prettier-plugin-astro'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
};
