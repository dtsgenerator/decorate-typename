declare namespace JsonSchemaOrg {
    namespace Complex {
        /**
         * complex patterns
         */
        export interface _Patterns_ {
            p: Patterns.Definitions._Primitives_;
            pr: Patterns.Definitions._PrimitivesRequired_;
            ut?: Patterns.Definitions._UnionTuple_;
            at?: Patterns.Definitions._ArrayTypes_;
            nt?: Patterns.Definitions._NestedTypes_;
            ct?: Patterns.Definitions._CommentTest_;
            ta?: Patterns.Definitions._TypeAlias_;
            array?: Patterns.Definitions._TypeArray_;
            const?: Patterns.Definitions._MathPi_ | Patterns.Definitions._IsDebug_ | Patterns.Definitions._IsTest_ | Patterns.Definitions._ProjectName_;
        }
        namespace Patterns {
            namespace Definitions {
                export interface _ArrayTypes_ {
                    strings?: string[];
                    numbers?: number[];
                    arrays?: string[][][];
                    array_of_array?: (string | string[])[];
                }
                /**
                 * comment test type.
                 * description comment.
                 * example:
                 *   obj = {
                 *     p1: 'example',
                 *     p2: true,
                 *     p3: [ false, 1.23, 'tuple' ],
                 *   }
                 */
                export interface _CommentTest_ {
                    /**
                     * p1 is string type.
                     */
                    p1: string;
                    /**
                     * p2 is union types.
                     * example:
                     * true or 1 or 'string'
                     */
                    p2: boolean | string | number;
                    /**
                     * p3 is tuple types
                     * example:
                     * true
                     * 2.5
                     * p3
                     */
                    p3: [
                        boolean,
                        number,
                        string?,
                        ...any[]
                    ];
                }
                export type _IsDebug_ = false;
                export type _IsTest_ = true;
                export type _MathPi_ = 3.1415926536;
                export interface _NestedTypes_ {
                    first: {
                        second: {
                            third: {};
                        };
                    };
                }
                export interface _Primitives_ {
                    readonly any?: any;
                    array?: any[];
                    boolean?: boolean;
                    double?: number; // double
                    int?: number; // int
                    integer?: number;
                    null?: null;
                    number?: number;
                    object?: {};
                    string?: string;
                    undefined?: undefined;
                }
                export interface _PrimitivesRequired_ {
                    readonly any: any;
                    array: any[];
                    boolean: boolean;
                    double: number; // double
                    int: number; // int
                    integer: number;
                    null: null;
                    number: number;
                    object: {};
                    string: string;
                    undefined: undefined;
                }
                export type _ProjectName_ = "dtsgenerator";
                export type _TypeAlias_ = _Primitives_ | _PrimitivesRequired_;
                export type _TypeArray_ = {
                    a: string;
                    b?: string;
                    n?: {
                        c: number;
                    }[];
                }[];
                export interface _UnionTuple_ {
                    s_tuple?: "A" | "B" | "C";
                    n_tuple?: 1 | 2 | 3 | 4 | 5;
                    some_types?: boolean | number | string;
                    ref_types?: _Primitives_ | _PrimitivesRequired_;
                }
            }
        }
    }
}
