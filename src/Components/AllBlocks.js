import React, { Component } from "react";
import { Link } from "react-router-dom";

import { graphql, compose, withApollo } from "react-apollo";
import QueryAllBlocks from "../GraphQL/QueryAllBlocks";
import MutationDeleteEvent from "../GraphQL/MutationDeleteEvent";

import moment from "moment";

class AllBlocks extends Component {

    state = {
        busy: false,
    }

    static defaultProps = {
        blocks: [],
        deleteEvent: () => null,
    }

    async handleDeleteClick(block, e) {
        e.preventDefault();

        if (window.confirm(`Are you sure you want to delete block ${block.id}`)) {
            const { deleteEvent } = this.props;

            await deleteEvent(block);
        }
    }

    handleSync = async () => {
        const { client } = this.props;
        const query = QueryAllBlocks;

        this.setState({ busy: true });

        await client.query({
            query,
            fetchPolicy: 'network-only',
        });

        this.setState({ busy: false });
    }

    renderEvent = (block) => (
        <Link to={`/block/${block.id}`} className="card" key={block.id}>
            <div className="content">
                <div className="header">{block.marketplaceSignatureOnDeal}</div>
            </div>
            <div className="content">
                <div className="description"><i className="icon info circle"></i>{block.hashOnDeal}</div>
            </div>
            <div className="extra content">
                <i className="icon comment"></i> {block.prevHashOnDeal}
            </div>
            <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, block)}>
                <i className="trash icon"></i>
                Delete
            </button>
        </Link>
    );

    render() {
        const { busy } = this.state;
        const { blocks } = this.props;

        return (
            <div>
                <div className="ui clearing basic segment">
                    <h1 className="ui header left floated">All Blocks</h1>
                    <button className="ui icon left basic button" onClick={this.handleSync} disabled={busy}>
                        <i aria-hidden="true" className={`refresh icon ${busy && "loading"}`}></i>
                        Sync with Server
                    </button>
                </div>
                <div className="ui link cards">
                    <div className="card blue">
                        <Link to="/newEvent" className="new-event content center aligned">
                            <i className="icon add massive"></i>
                            <p>Create new block -TEMP - to be removed</p>
                        </Link>
                    </div>
                    {[].concat(blocks).sort((a, b) => a.when.localeCompare(b.when)).map(this.renderEvent)}
                </div>
            </div>
        );
    }

}

export default withApollo(compose(
    graphql(
        QueryAllBlocks,
        {
            options: {
                fetchPolicy: 'cache-first',
            },
            props: ({ data: { listBlocks = { items: [] } } }) => ({
                blocks: listBlocks.items
            })
        }
    ),
    graphql(
        MutationDeleteEvent,
        {
            options: {
                update: (proxy, { data: { deleteEvent } }) => {
                    const query = QueryAllBlocks;
                    const data = proxy.readQuery({ query });

                    data.listBlocks.items = data.listBlocks.items.filter(block => block.id !== deleteEvent.id);

                    proxy.writeQuery({ query, data });
                }
            },
            props: (props) => ({
                deleteEvent: (block) => {
                    return props.mutate({
                        variables: { id: block.id },
                        optimisticResponse: () => ({
                            deleteEvent: {
                                ...block, __typename: 'Event', comments: { __typename: 'CommentConnection', items: [] }
                            }
                        }),
                    });
                }
            })
        }
    )
)(AllBlocks));
