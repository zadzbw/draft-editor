module.exports = {
  syntax: 'scss',
  extends: [
    'stylelint-config-standard',
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'global',
        ],
      },
    ],
    'at-rule-no-unknown': null,
    'at-rule-empty-line-before': null,
    'block-closing-brace-newline-after': null,
    'selector-pseudo-element-colon-notation': 'single',
    'selector-list-comma-newline-after': 'always-multi-line',
    'number-no-trailing-zeros': null,
    'no-descending-specificity': null,
    // 'no-empty-source': null,
    // 'font-family-no-missing-generic-family-keyword': null,
  },
};
