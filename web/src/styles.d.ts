declare module '*.css' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, unicorn/no-keyword-prefix
  const content: { [className: string]: string }
  export default content
}
