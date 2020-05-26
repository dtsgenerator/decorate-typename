# @dtsgenerator/decorate-typename

This is the `dtsgenerator` plugin.
Decorate the output typename.
Such as it add the `I` prefix to the interface name.

# Install

```
npm install @dtsgenerator/decorate-typename
```

# Usage

`dtsgen.json`
```json
{
    "plugins": {
        "@dtsgenerator/decorate-typename": {
            "interface": {
                "prefix": "I"
            },
            "type": {
                "prefix": "T"
            }
        }
    }
}
```

# Configuration

- the type of configuration
```
interface ConfigContent {
    prefix?: string;
    postfix?: string;
}
export type Config =
    | {
          interface: ConfigContent;
          type: ConfigContent;
      }
    | ConfigContent;
```

| key | type | description |
|-----|------|-------------|
| prefix | string | the prefix of type name. |
| postfix | string | the postfix of type name. |
| interface | ConfigContent | the prefix and postfix apply to the interface name only. |
| type | ConfigContent | the prefix and postfix apply to the type alias name only. |


- Example
```
{
  "prefix": "I",
}
```

```
{
  "interface": {
    "prefix": "I",
    "postfix": "_"
  },
  "type": {
    "prefix": "T",
    "postfix": "_"
  }
}
```


# Development

```
npm run build
npm test
```

## Stacks

- TypeScript
- eslint
- prettier

## Files

- `index.ts`: plugin main file
- `test/snapshot_test.ts`: test main file. should not edit this file.
- `test/post_snapshots/`: post process test patterns. Please add folder if you need.
- `test/pre_snapshots/`: pre process test patterns. Please add folder if you need.

## npm scripts

### main scripts

- `npm run build`: transpile this plugin. This command need before publishing this plugin.
- `npm test`: test this plugin with coverage.

### sub scripts

- `npm run watch`: watch editing files for compile.
- `npm run lint:fix`: fix lint error automatically.
- `npm run test:update-snapshot`: update snapshot files for unit test.
- `npm run coverage`: report to [coveralls](https://coveralls.io/). Need coveralls configuration file.
