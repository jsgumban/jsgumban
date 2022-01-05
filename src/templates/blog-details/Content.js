import React, {Fragment} from 'react';
import {Link} from "react-router-dom";
import socials from '../../data/social-networks'

const BlogDetailsContent = ({title, meta, description}) => {
    return (
        <Fragment>
            <div className="blog-content">

                <h2 className="blog-title">{title}</h2>

                <ul className="blog-meta">
                    <li>
                        <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>
                            <i className="fa fa-user"/>{meta.author}
                        </Link>
                    </li>
                    <li>
                        <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`}>
                            <i className="fa fa-comments"/>Comments ( {meta.comments} )
                        </Link>
                    </li>
                </ul>

                <div className="blog-desc">
                    <span dangerouslySetInnerHTML={{__html: description}}/>
                </div>

            </div>

            <div className="blog-footer col-12 pl-0 pr-0 fix">
                <div className="row">
                    <div
                        className="blog-social-share d-flex justify-content-center col-md-6 col-12 order-1 order-md-2 mb-xs-20">
                        {socials.map(social => (
                            <a key={social.id} href={`https://${social.media}/${social.username}`}>
                                <i className={`fa fa-${social.media}`}/>
                            </a>
                        ))}
                    </div>

                    <div className="d-flex justify-content-start col-md-3 col-6 order-2 order-md-1">
                        <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`} className="post-nav old-post">
                            <i className="fa fa-long-arrow-left"/>Older
                        </Link>
                    </div>

                    <div className="d-flex justify-content-end col-md-3 col-6 order-3">
                        <Link to={`${process.env.PUBLIC_URL + '/blog-details'}`} className="post-nav new-post">
                            <i className="fa fa-long-arrow-right"/>new
                        </Link>
                    </div>

                </div>
            </div>
        </Fragment>
    );
};

export default BlogDetailsContent;