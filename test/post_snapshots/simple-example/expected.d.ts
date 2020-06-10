declare namespace JsonSchemaOrg {
    /**
     * A geographical coordinate
     */
    export interface IGeo_ {
        latitude?: number;
        longitude?: number;
    }
    /**
     * Product set
     */
    export type TSimpleExample_ = {
        /**
         * The unique identifier for a product
         */
        id: number;
        name: string;
        price: number;
        tags?: string[];
        dimensions?: {
            length: number;
            width: number;
            height: number;
        };
        /**
         * Coordinates of the warehouse with the product
         */
        warehouseLocation?: IGeo_;
    }[];
}
