module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-prettier/recommended'
  ],
  rules: {
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'font-family-name-quotes': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ]
  }
}
