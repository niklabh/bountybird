// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Head from 'next/head';
import React, { FC } from 'react';
import sanitizeMarkdown from '../utils/sanitizeMarkdown';

interface ISEOHeadProps {
    title?: string;
    desc?: string;
	img?: string;
}

const SEOHead: FC<ISEOHeadProps> = (props) => {
	const { title, desc, img } = props;
	const descString = sanitizeMarkdown(desc) || 'Bounty Bird';
	const titleString = title || 'Bounty Bird';
	return (
		<Head>
			<meta charSet="utf-8" />
			<title>{titleString}</title>
			<meta name="description" content={descString} />
			<link rel="icon" href="/favicon.ico" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="theme-color" content="#04152F" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={descString} />
			<meta property="og:type" content="website" />
			<meta property="og:image" content={img || 'https://i.ibb.co//Cznxkrj//bountybird-cover-image.png'} />
			<meta property="og:image:width" content="751" />
			<meta property="og:image:height" content="501" />
			<meta property="og:image" content={img || 'https://i.ibb.co//Cznxkrj//bountybird-cover-image.png'} />
			<meta property="og:image:width" content="608" />
			<meta property="og:image:height" content="608" />
			<link rel="apple-touch-icon" href="/logo192.png" />
		</Head>
	);
};

export default SEOHead;