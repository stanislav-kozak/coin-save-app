export interface paths {
    "/api": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AppController_getHello"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_signup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_verifyEmail"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_resendVerification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_googleStart"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/google/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_googleCallback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/request-password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_requestPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SpacesController_list"];
        put?: never;
        post: operations["SpacesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SpacesController_get"];
        put?: never;
        post?: never;
        delete: operations["SpacesController_remove"];
        options?: never;
        head?: never;
        patch: operations["SpacesController_update"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SpacesController_listMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/members/{membershipId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["SpacesController_removeMember"];
        options?: never;
        head?: never;
        patch: operations["SpacesController_changeMemberRole"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/leave": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SpacesController_leave"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SpacesController_listInvitations"];
        put?: never;
        post: operations["SpacesController_invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/invitations/{invitationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["SpacesController_revokeInvitation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/invitations/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["InvitationsController_accept"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/wallets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["WalletsController_list"];
        put?: never;
        post: operations["WalletsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/wallets/{walletId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["WalletsController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["WalletsController_update"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/wallets/{walletId}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["WalletsController_archive"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/wallets/{walletId}/unarchive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["WalletsController_unarchive"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CategoriesController_list"];
        put?: never;
        post: operations["CategoriesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/categories/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["CategoriesController_reorder"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/categories/{categoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CategoriesController_get"];
        put?: never;
        post?: never;
        delete: operations["CategoriesController_remove"];
        options?: never;
        head?: never;
        patch: operations["CategoriesController_update"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/categories/{categoryId}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["CategoriesController_archive"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/categories/{categoryId}/unarchive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["CategoriesController_unarchive"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/expenses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ExpensesController_list"];
        put?: never;
        post: operations["ExpensesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/expenses/{expenseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ExpensesController_get"];
        put?: never;
        post?: never;
        delete: operations["ExpensesController_remove"];
        options?: never;
        head?: never;
        patch: operations["ExpensesController_update"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/recurring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RecurringController_list"];
        put?: never;
        post: operations["RecurringController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/recurring/{recurringId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RecurringController_get"];
        put?: never;
        post?: never;
        delete: operations["RecurringController_remove"];
        options?: never;
        head?: never;
        patch: operations["RecurringController_update"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/recurring/{recurringId}/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["RecurringController_pause"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/recurring/{recurringId}/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["RecurringController_resume"];
        trace?: never;
    };
    "/api/spaces/{spaceId}/analytics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_getAnalytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/spaces/{spaceId}/expenses.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_exportExpensesCsv"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        SignupDto: {
            /** Format: email */
            email: string;
            password: string;
            name?: string;
        };
        MessageResponseDto: {
            message: string;
        };
        /**
         * @description Stable machine-readable code; localize on the client
         * @enum {string}
         */
        ErrorCode: "EMAIL_ALREADY_EXISTS" | "EMAIL_DELIVERY_FAILED" | "INVALID_CREDENTIALS" | "EMAIL_NOT_VERIFIED" | "INVALID_VERIFICATION_TOKEN" | "INVALID_REFRESH_TOKEN" | "REFRESH_TOKEN_REUSE_DETECTED" | "INVALID_RESET_TOKEN" | "FORBIDDEN_NOT_MEMBER" | "FORBIDDEN_NOT_OWNER" | "SPACE_NOT_FOUND" | "MEMBER_NOT_FOUND" | "ALREADY_MEMBER" | "INVALID_INVITATION_TOKEN" | "INVITATION_EMAIL_MISMATCH" | "INVITATION_NOT_FOUND" | "CANNOT_REMOVE_LAST_OWNER" | "WALLET_NOT_FOUND" | "CATEGORY_NOT_FOUND" | "CATEGORY_NAME_TAKEN" | "INVALID_REORDER" | "CURRENCY_API_UNAVAILABLE" | "CURRENCY_NOT_SUPPORTED" | "EXPENSE_NOT_FOUND" | "INVALID_OCCURRED_AT" | "INVALID_RECURRING_DATE_RANGE" | "WALLET_ARCHIVED" | "CATEGORY_ARCHIVED" | "INVALID_PERIOD" | "RECURRING_NOT_FOUND" | "VALIDATION_ERROR" | "HTTP_ERROR" | "INTERNAL_ERROR";
        ErrorResponseDto: {
            /** @example 404 */
            statusCode: number;
            /** @description Stable machine-readable code; localize on the client */
            code: components["schemas"]["ErrorCode"];
            /** @description Developer-facing English message */
            message: string;
            details?: {
                [key: string]: unknown;
            };
        };
        VerifyEmailDto: {
            token: string;
        };
        ResendVerificationDto: {
            /** Format: email */
            email: string;
        };
        LoginDto: {
            /** Format: email */
            email: string;
            password: string;
        };
        AuthenticatedUserDto: {
            id: string;
            email: string;
        };
        LoginResponseDto: {
            user: components["schemas"]["AuthenticatedUserDto"];
        };
        UserResponseDto: {
            id: string;
            email: string;
            /** Format: date-time */
            emailVerified: string | null;
            name: string | null;
            avatarUrl: string | null;
            /** @example uk */
            locale: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        RequestPasswordResetDto: {
            /** Format: email */
            email: string;
        };
        ResetPasswordDto: {
            token: string;
            newPassword: string;
        };
        CreateSpaceDto: {
            name: string;
        };
        SpaceResponseDto: {
            id: string;
            name: string;
            slug: string;
            ownerId: string;
            primaryCurrency: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        /**
         * @description Caller's role
         * @enum {string}
         */
        Role: "OWNER" | "MEMBER";
        SpaceWithRoleResponseDto: {
            id: string;
            name: string;
            slug: string;
            primaryCurrency: string;
            /** @description Caller's role */
            role: components["schemas"]["Role"];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        UpdateSpaceDto: {
            name?: string;
            primaryCurrency?: string;
        };
        MemberResponseDto: {
            membershipId: string;
            userId: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
            role: components["schemas"]["Role"];
            /** Format: date-time */
            joinedAt: string;
        };
        ChangeMemberRoleDto: {
            /** @enum {string} */
            role: "OWNER" | "MEMBER";
        };
        MembershipResponseDto: {
            id: string;
            userId: string;
            spaceId: string;
            role: components["schemas"]["Role"];
            /** Format: date-time */
            joinedAt: string;
        };
        InviteMemberDto: {
            /** Format: email */
            email: string;
        };
        InvitationResponseDto: {
            id: string;
            email: string;
            role: components["schemas"]["Role"];
            invitedById: string;
            /** Format: date-time */
            expiresAt: string;
            /** Format: date-time */
            createdAt: string;
        };
        AcceptInvitationDto: {
            token: string;
        };
        CreateWalletDto: {
            name: string;
            /** @enum {string} */
            currency: "USD" | "EUR" | "GBP" | "PLN" | "CZK" | "CHF" | "CAD" | "AUD" | "JPY" | "TRY" | "RON" | "UAH" | "RUB";
            icon?: string;
            color?: string;
        };
        WalletResponseDto: {
            id: string;
            spaceId: string;
            name: string;
            /** @description ISO 4217 currency code */
            currency: string;
            icon: string | null;
            color: string | null;
            /**
             * Format: decimal
             * @example 1250.5
             */
            initialBalance: string;
            /**
             * Format: decimal
             * @description initialBalance plus incomes minus expenses
             * @example 1250.5
             */
            balance: string;
            archived: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        UpdateWalletDto: {
            name?: string;
            icon?: string;
            color?: string;
        };
        CreateCategoryDto: {
            /** @example 12.5 */
            monthlyLimit?: number;
            name: string;
            icon?: string;
            color?: string;
        };
        CategoryResponseDto: {
            id: string;
            spaceId: string;
            name: string;
            icon: string | null;
            color: string | null;
            /**
             * Format: decimal
             * @description In the space's primary currency
             * @example 1250.5
             */
            monthlyLimit: string | null;
            archived: boolean;
            sortOrder: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        ReorderCategoriesDto: {
            orderedIds: string[];
        };
        UpdateCategoryDto: {
            /** @example 12.5 */
            monthlyLimit?: number;
            name?: string;
            icon?: string;
            color?: string;
        };
        CreateExpenseDto: {
            /** @example 12.5 */
            amount: number;
            walletId: string;
            categoryId?: string;
            /** @enum {string} */
            type: "EXPENSE" | "INCOME";
            occurredAt: string;
            note?: string;
        };
        /** @enum {string} */
        TransactionType: "EXPENSE" | "INCOME";
        ExpenseResponseDto: {
            id: string;
            spaceId: string;
            walletId: string;
            categoryId: string | null;
            type: components["schemas"]["TransactionType"];
            /**
             * Format: decimal
             * @description In walletCurrency
             * @example 1250.5
             */
            amount: string;
            walletCurrency: string;
            /**
             * Format: decimal
             * @description In the space's primary currency
             * @example 1250.5
             */
            amountInPrimary: string;
            /**
             * Format: decimal
             * @description Exchange rate used for conversion
             * @example 1250.5
             */
            fxRate: string;
            note: string | null;
            /** Format: date-time */
            occurredAt: string;
            createdById: string;
            recurringId: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        UpdateExpenseDto: {
            /** @example 12.5 */
            amount?: number;
            walletId?: string;
            categoryId?: string;
            occurredAt?: string;
            note?: string;
        };
        CreateRecurringTransactionDto: {
            /** @example 12.5 */
            amount: number;
            walletId: string;
            categoryId?: string;
            /** @enum {string} */
            type: "EXPENSE" | "INCOME";
            name: string;
            note?: string;
            frequency: string;
            dayOfMonth: number;
            startDate: string;
            endDate?: string;
        };
        /** @enum {string} */
        RecurringFrequency: "MONTHLY";
        RecurringTransactionResponseDto: {
            id: string;
            spaceId: string;
            walletId: string;
            categoryId: string | null;
            type: components["schemas"]["TransactionType"];
            /**
             * Format: decimal
             * @example 1250.5
             */
            amount: string;
            currency: string;
            name: string;
            note: string | null;
            frequency: components["schemas"]["RecurringFrequency"];
            dayOfMonth: number;
            /** Format: date-time */
            startDate: string;
            /** Format: date-time */
            endDate: string | null;
            /** Format: date-time */
            lastGeneratedAt: string | null;
            active: boolean;
            createdById: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        UpdateRecurringTransactionDto: {
            /** @example 12.5 */
            amount?: number;
            walletId?: string;
            categoryId?: string | null;
            name?: string;
            note?: string;
            dayOfMonth?: number;
            endDate?: string | null;
        };
        AnalyticsPeriodDto: {
            /** @example 2026-09-01 */
            from: string;
            /** @example 2026-09-30 */
            to: string;
        };
        AnalyticsByCategoryDto: {
            /** @description null for the "Uncategorized" bucket */
            categoryId: string | null;
            name: string;
            icon: string | null;
            color: string | null;
            /**
             * Format: decimal
             * @example 1250.5
             */
            spent: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            limit: string | null;
            /** @description spent / limit as a rounded percentage; 0 when no limit */
            pct: number;
        };
        AnalyticsByDayDto: {
            /** @example 2026-09-15 */
            date: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            expense: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            income: string;
        };
        AnalyticsExpenseItemDto: {
            id: string;
            type: components["schemas"]["TransactionType"];
            /**
             * Format: decimal
             * @example 1250.5
             */
            amount: string;
            walletCurrency: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            amountInPrimary: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            fxRate: string;
            note: string | null;
            /** Format: date-time */
            occurredAt: string;
            walletId: string;
            walletName: string;
            categoryId: string | null;
            categoryName: string;
            createdById: string;
            createdByName: string;
        };
        AnalyticsResponseDto: {
            /** @description The space's primary currency */
            currency: string;
            period: components["schemas"]["AnalyticsPeriodDto"];
            /**
             * Format: decimal
             * @example 1250.5
             */
            totalExpense: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            totalIncome: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            previousPeriodExpense: string;
            /**
             * Format: decimal
             * @example 1250.5
             */
            previousPeriodIncome: string;
            byCategory: components["schemas"]["AnalyticsByCategoryDto"][];
            byDay: components["schemas"]["AnalyticsByDayDto"][];
            expenses: components["schemas"]["AnalyticsExpenseItemDto"][];
        };
        HealthDbStatusDto: {
            /** @enum {string} */
            status: "up" | "down";
            error?: string;
        };
        HealthResponseDto: {
            /** @enum {string} */
            status: "ok" | "error";
            db: components["schemas"]["HealthDbStatusDto"];
            /** @description Process uptime in seconds */
            uptime: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AppController_getHello: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    AuthController_signup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EMAIL_ALREADY_EXISTS */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EMAIL_DELIVERY_FAILED */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_verifyEmail: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_VERIFICATION_TOKEN */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_resendVerification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResendVerificationDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponseDto"];
                };
            };
            /** @description Codes: INVALID_CREDENTIALS, HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EMAIL_NOT_VERIFIED */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
        };
    };
    AuthController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: INVALID_REFRESH_TOKEN, REFRESH_TOKEN_REUSE_DETECTED */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_googleStart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirects to Google OAuth consent */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_googleCallback: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sets auth cookies and redirects to the frontend */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_requestPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestPasswordResetDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_RESET_TOKEN */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpaceWithRoleResponseDto"][];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSpaceDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpaceResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpaceResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, FORBIDDEN_NOT_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSpaceDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpaceResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, FORBIDDEN_NOT_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_listMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberResponseDto"][];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_removeMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                membershipId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, FORBIDDEN_NOT_OWNER, CANNOT_REMOVE_LAST_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: MEMBER_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_changeMemberRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                membershipId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeMemberRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, FORBIDDEN_NOT_OWNER, CANNOT_REMOVE_LAST_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: MEMBER_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_leave: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, CANNOT_REMOVE_LAST_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_listInvitations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationResponseDto"][];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_invite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteMemberDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: ALREADY_MEMBER */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SpacesController_revokeInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                invitationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER, FORBIDDEN_NOT_OWNER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: INVITATION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    InvitationsController_accept: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInvitationDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_INVITATION_TOKEN */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: INVITATION_EMAIL_MISMATCH */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: ALREADY_MEMBER */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_list: {
        parameters: {
            query?: {
                includeArchived?: boolean;
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"][];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateWalletDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                walletId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                walletId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateWalletDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_archive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                walletId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    WalletsController_unarchive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                walletId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WalletResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_list: {
        parameters: {
            query?: {
                includeArchived?: boolean;
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"][];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCategoryDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NAME_TAKEN */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderCategoriesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"][];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_REORDER */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCategoryDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NAME_TAKEN */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_archive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CategoriesController_unarchive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ExpensesController_list: {
        parameters: {
            query?: {
                walletId?: string;
                categoryId?: string;
                type?: "EXPENSE" | "INCOME";
                from?: string;
                to?: string;
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseResponseDto"][];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ExpensesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateExpenseDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_OCCURRED_AT, CURRENCY_NOT_SUPPORTED */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND, CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_ARCHIVED, CATEGORY_ARCHIVED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CURRENCY_API_UNAVAILABLE */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ExpensesController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                expenseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EXPENSE_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ExpensesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                expenseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EXPENSE_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    ExpensesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                expenseId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateExpenseDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_OCCURRED_AT, CURRENCY_NOT_SUPPORTED */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: EXPENSE_NOT_FOUND, WALLET_NOT_FOUND, CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_ARCHIVED, CATEGORY_ARCHIVED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: CURRENCY_API_UNAVAILABLE */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_list: {
        parameters: {
            query?: {
                includeInactive?: boolean;
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"][];
                };
            };
            /** @description Codes: VALIDATION_ERROR */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRecurringTransactionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_RECURRING_DATE_RANGE */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_NOT_FOUND, CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_ARCHIVED, CATEGORY_ARCHIVED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                recurringId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: RECURRING_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                recurringId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: RECURRING_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                recurringId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateRecurringTransactionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_RECURRING_DATE_RANGE */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: RECURRING_NOT_FOUND, WALLET_NOT_FOUND, CATEGORY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: WALLET_ARCHIVED, CATEGORY_ARCHIVED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_pause: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                recurringId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: RECURRING_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RecurringController_resume: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                spaceId: string;
                recurringId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecurringTransactionResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: RECURRING_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AnalyticsController_getAnalytics: {
        parameters: {
            query: {
                from: string;
                to: string;
                walletIds?: string[];
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnalyticsResponseDto"];
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_PERIOD */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AnalyticsController_exportExpensesCsv: {
        parameters: {
            query: {
                from: string;
                to: string;
            };
            header?: never;
            path: {
                spaceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description UTF-8 CSV with BOM */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": string;
                };
            };
            /** @description Codes: VALIDATION_ERROR, INVALID_PERIOD */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Codes: FORBIDDEN_NOT_MEMBER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponseDto"];
                };
            };
            /** @description Codes: HTTP_ERROR */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
}
