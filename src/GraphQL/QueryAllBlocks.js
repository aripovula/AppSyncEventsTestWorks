import gql from "graphql-tag";

export default gql(`
query {
  listBlocks(limit: 4) {
    items {
      id
      hashOnDeal
      prevHashOnDeal
    }
  }
}`);
