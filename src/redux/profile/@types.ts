// Copyright 2019-2025 @polka-labs/townhall authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IUser } from "@/src/types";

export interface IProfileStore {
    user: IUser | null;

    loading: boolean;
    error: string | null;

    privy_loading: boolean;
}

export interface IEditableProfile {
    name?: string;
    username?: string;
    bio?: string;
    lens_handle?: string;
}