import { createCn } from 'cn/config';

/**
 * Class merger that knows the design-system tokens from globals.css, so e.g.
 * `cn('text-h1', 'text-destructive')` keeps the size instead of treating `text-h1` as a color.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'body', 'caption', 'money'] }],
      rounded: [{ rounded: ['card', 'control'] }],
      shadow: [{ shadow: ['card', 'card-raised', 'modal'] }],
    },
  },
});
