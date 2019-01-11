import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

import moment from 'moment';

import QueryGetBlock from "../GraphQL/QueryGetBlock";

class ViewBlock extends Component {

    render() {
        const { block, loading } = this.props;

        return (
            <div className={`ui container raised very padded segment ${loading ? 'loading' : ''}`}>
                <Link to="/" className="ui button">Back to blocks</Link>
                <div className="ui items">
                    <div className="item">
                        {block && <div className="content">
                            <div className="header">{block.marketplaceSignatureOnDeal}</div>
                            <div className="extra"><i className="icon marker"></i>{block.hashOnDeal}</div>
                            <div className="description">{block.prevHashOnDeal}</div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

}

const ViewBlockWithData = graphql(
    QueryGetBlock,
    {
        options: ({ match: { params: { id } } }) => ({
            variables: { id },
            fetchPolicy: 'cache-and-network',
        }),
        props: ({ data: { getBlock: block, loading} }) => ({
            block,
            loading,
        }),
    },
)(ViewBlock);

export default ViewBlockWithData;