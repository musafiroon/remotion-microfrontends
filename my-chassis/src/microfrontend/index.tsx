/* eslint-disable no-negated-condition */
import classNames from 'classnames';
import React, {useEffect, useState, useRef} from 'react';
import {useQuery} from 'react-query';
import PropTypes from 'prop-types';
import assert from 'tiny-invariant';

import {loadMicrofrontend} from './utils/loader.utils';
import {
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
	VideoConfig,
} from 'remotion';

export type MicrofrontendProps = {
	scope: string;
	entry: string;
	module: string;
	url?: string;
	key?: string;
	id?: string;
	hasDelayedRender?: boolean;
	className?: string;
	Loading?: JSX.Element | (() => JSX.Element);
	composition?: String;
	loadMicrofrontend?: (manifest: {
		scope: string;
		entry: string;
		module: string;
		composition?: string;
	}) => Promise<{
		mount: (
			containerRef: string | HTMLElement,
			props: {frame: number; config: VideoConfig; continueRender: () => void}
		) => () => void;
		unmount: (containerRef: string | HTMLElement) => void;
	}>;
};

export const Microfrontend = ({
	id,
	scope,
	entry,
	module,
	Loading,
	className,
	hasDelayedRender,
	loadMicrofrontend,
	composition = 'default',
}: MicrofrontendProps) => {
	const [handle] = useState(() => delayRender());
	const frame = useCurrentFrame();
	const config = useVideoConfig();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// eslint-disable-next-line camelcase
		window.remotion_imported = false;
	}, []);
	const {
		isFetched: isMounted,
		isError,
		error,
		data,
	} = useQuery(`microfrontend?entry=${entry}&module=${module}`, async () => {
		assert(loadMicrofrontend, 'props.loadMicrofrontend must be a function');
		return loadMicrofrontend({
			entry,
			scope,
			module,
			composition: 'MyComposition1',
		});
	});
	const mount = data?.mount;
	console.log(data);

	const mfClassName = classNames(
		'microfrontend-container spin-when-empty',
		className
	);

	const containerId = `mount-${(id || scope).toLowerCase()}-container`;
	const [mfError, setMFError] = useState<Error | null>(null);

	useEffect(() => {
		if (!isMounted || isError || typeof mount !== 'function') {
			return;
		}

		let unmount: (() => void) | null = null;
		try {
			//@ts-ignore
			unmount = mount(containerRef.current, {
				frame,
				config,
				continueRender: () => continueRender(handle),
			});
			if (!hasDelayedRender) {
				continueRender(handle);
			}
		} catch (error) {
			setMFError(
				new Error(
					`Could not mount Microfrontend: ${scope} (${module})\n${error}`
				)
			);
		}
		return () => {
			try {
				if (typeof unmount === 'function') {
					console.log('unmount', scope);
					unmount();
				}
			} catch (err) {
				console.error(err);
				setMFError(
					new Error(
						`Could not mount Microfrontend: ${scope} (${module})\n${error}`
					)
				);
			}
		};
	}, [isMounted, isError, entry, module, frame, config]);

	return isError ? (
		<div>
			{(error instanceof Error
				? error
				: new Error(
						typeof error === 'string'
							? error
							: `An error occurred in a microfrontend: ${error}`
				  )
			).toString()}
		</div>
	) : mfError ? (
		<div>{mfError.toString()}</div>
	) : !isMounted ? (
		typeof Loading === 'function' ? (
			<Loading />
		) : Loading ? (
			Loading
		) : (
			<div>...loading...</div>
		)
	) : (
		<div
			id={containerId}
			className={mfClassName}
			{...{'data-mf-scope': scope, 'data-mf-module': module}}
			ref={containerRef}
		/>
	);
};

Microfrontend.defaultProps = {
	loadMicrofrontend,
	Loading: () => <div>...loading...</div>,
};

Microfrontend.propTypes = {
	loadMicrofrontend: PropTypes.func,
};
