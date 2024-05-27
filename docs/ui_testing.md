# UI Testing

## Accessing elements by `role` and `name`

[React Testing Library] recommends to [prioritize][priority] obtaining elements from the UI by [getByRole].
The [getByRole] article links to [default `role`s reference].

In addition, [MUI] has its own guidance for accessibility.
For example, [`switch` accessibility] says the role is `checkbox` and without proper use of labelling
(as it is unfortunately the case in the current implementation) one has to set `aria-label` in the input,
like this:

``` tsx
<Label typographyVariant="body1">Show outro</Label>
<Switch
    // (...)
    inputProps={{ 'aria-label': 'Show Outro' }}
/>
```

So that I can do:

``` ts
const name = "Show Outro"
screen.getByRole("checkbox" { name })
```

## Further reading

### Blog posts

- [Name, labels, ARIA, what to do?](https://www.scottohara.me/blog/2021/11/02/names-and-labels.html)
- [Decoding Label and Name for Accessibility](https://webaim.org/articles/label-name/)
- [What's in a name?](https://sarahmhigley.com/writing/whats-in-a-name/)

### mdn web docs

- [Using ARIA: Roles, states, and properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques#roles)
- [WAI-ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [Accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name)

[`switch` accessibility]: https://mui.com/material-ui/react-switch/#accessibility
[default `role`s reference]: https://www.w3.org/TR/html-aria/#docconformance
[getByRole]: https://testing-library.com/docs/queries/byrole/#api
[MUI]: https://mui.com/material-ui/getting-started/
[priority]: https://testing-library.com/docs/queries/about#priority
[React Testing Library]: https://testing-library.com/docs/react-testing-library/intro
