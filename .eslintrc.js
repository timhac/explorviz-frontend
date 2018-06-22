module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
	'airbnb-base'
  ],
  env: {
    browser: true
  },
  rules: {
	'import/no-unresolved': 0,
	'import/extensions': 0,
	'no-param-reassign': 0,
	'radix': 0,
	'vars-on-top': 0,
	'no-shadow': 0,
	'no-use-before-define': 0,
	'camelcase': 0,
	'comma-dangle': 0,
	'no-plusplus': 0,
	'no-var': 0,
	'object-shorthand': 0,
	'prefer-arrow-callback': 0,
	'prefer-rest-params': 0,
	'prefer-spread': 0,
	'func-names': 0,
	'no-underscore-dangle': 0,
	'quote-props': 0,
	'no-bitwise': 0,
	'ember/avoid-leaking-state-in-ember-objects': 0,
	'global-require': 0,
	'linebreak-style': 0,
	'valid-typeof': 0,
	'no-unneeded-ternary': 0,
	'array-callback-return': 0,
	'consistent-return': 0,
	'import/prefer-default-export': 0,
	
	
  },
  overrides: [
    // node files
    {
      files: [
        'ember-cli-build.js',
        'testem.js',
        'config/**/*.js',
        'lib/*/index.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};
