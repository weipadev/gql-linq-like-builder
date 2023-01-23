# GraphQL Linq-like-Builder

Angular library to generate GraphQL queries through the builder design pattern.

<a href="https://www.npmjs.com/package/@weipa/gql-linq-like-builder">
<img src="https://img.shields.io/npm/dt/@weipa/gql-linq-like-builder?label=Downloads" alt="downloads" />
</a>
<a href=https://stackblitz.com/edit/demo-gql-linq-lke-builder>
<img src="https://img.shields.io/static/v1?label= &message=StackBlitz&color=blue" />

</a>

## Install

`npm install @weipa/gql-linq-like-builder --save`

## Usage

```typescript
import { QueryBuilder } from "@weipa/gql-linq-like-builder";

let queryBuilder: QueryBuilder = new QueryBuilder(operation: string, isCollection: boolean);
```

## Examples

1. <a href="#query">Query</a>
2. <a href="#query-with-variables">Query (with variables)</a>
3. <a href="#query-with-nested-fields-selection">Query (with nested fields selection)</a>

#### Query:

```javascript
import { QueryBuilder } from "@weipa/gql-linq-like-builder";

let queryBuilder: QueryBuilder = new QueryBuilder("user");

queryBuilder.AddColumn("id")
    .AddColumn("name")
    .AddColumn("surname");

let query: Query = queryBuilder.GetQuery();

console.log(query.ToString());

// Output
{
    user
    {
        items {
            id, 
            name, 
            surname
        }
    }
}
```

[↑ all examples](#examples)

#### Query (with variables):

```javascript
import { QueryBuilder } from "@weipa/gql-linq-like-builder";

let queryBuilder: QueryBuilder = new QueryBuilder("user");
queryBuilder.CreateFilter().AddCondition("id", MatchTypeEnum.EQUALS, 1);

queryBuilder.AddColumn("id")
    .AddColumn("name")
    .AddColumn("surname");

let query: Query = queryBuilder.GetQuery();

console.log(query.ToString());

// Output
{
    user(where: {id: {
        eq: 1
    }})
    {
        items {
            id, 
            name, 
            surname
        }, 
    }
}
```

[↑ all examples](#examples)

#### Query (with nested fields selection):

```javascript
import { QueryBuilder } from "@weipa/gql-linq-like-builder";

let queryBuilder: QueryBuilder = new QueryBuilder("user");

queryBuilder.AddColumn("id")
    .AddColumn("name")
    .AddColumn("surname")
    .AddEntity("profile")
        .AddColumn("id")
        .AddColumn("description");

let query: Query = queryBuilder.GetQuery();

console.log(query.ToString());
// Output
{
    user
    {
        items {
        id, 
        name, 
        surname, 
        profile {
            id, 
            description
        }
        }, 
    }
}
```

## Author

- Weipa Automation & Systems - [GitHub](https://github.com/weipadev)

## Contributors

**If you are interested in actively maintaining / enhancing this project, get in <a href="mailto:dev@weipa.com.br">touch</a>.**

- André Weiss - [GitHub](https://github.com/weissandre)
- [YOUR NAME HERE] - Feel free to contribute to the codebase by resolving any open issues, refactoring, adding new features, writing test cases or any other way to make the project better and helpful to the community. Feel free to fork and send pull requests.

## License

Copyright (c) 2023 Weipa <https://weipa.com.br>

The MIT License (<http://www.opensource.org/licenses/mit-license.php>)