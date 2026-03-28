import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlotDimensions {
    length: bigint;
    width: bigint;
}
export interface Room {
    name: string;
    length: bigint;
    width: bigint;
}
export type Time = bigint;
export interface HouseLayout {
    id: bigint;
    created: Time;
    owner: Principal;
    floors: bigint;
    name: string;
    plot: PlotDimensions;
    amenities: Array<Amenity>;
    rooms: Array<Room>;
}
export interface Amenity {
    name: string;
    count: bigint;
}
export interface backendInterface {
    createLayout(name: string, plot: PlotDimensions, floors: bigint, rooms: Array<Room>, amenities: Array<Amenity>): Promise<bigint>;
    deleteLayout(id: bigint): Promise<void>;
    getLayout(id: bigint): Promise<HouseLayout>;
    getLayoutsByUser(user: Principal): Promise<Array<HouseLayout>>;
    searchLayoutsByName(name: string): Promise<Array<HouseLayout>>;
    updateLayout(id: bigint, layout: HouseLayout): Promise<void>;
}
