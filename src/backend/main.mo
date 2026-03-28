import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";

actor {
  type PlotDimensions = {
    width : Nat;
    length : Nat;
  };

  type Room = {
    name : Text;
    width : Nat;
    length : Nat;
  };

  type Amenity = {
    name : Text;
    count : Nat;
  };

  type HouseLayout = {
    id : Nat;
    owner : Principal;
    name : Text;
    plot : PlotDimensions;
    floors : Nat;
    rooms : [Room];
    amenities : [Amenity];
    created : Time.Time;
  };

  module HouseLayout {
    public func compare(a : HouseLayout, b : HouseLayout) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let layouts = Map.empty<Nat, HouseLayout>();
  var nextId = 0;

  func getLayoutInternal(id : Nat) : HouseLayout {
    switch (layouts.get(id)) {
      case (null) { Runtime.trap("Layout not found") };
      case (?layout) { layout };
    };
  };

  public query ({ caller }) func getLayout(id : Nat) : async HouseLayout {
    getLayoutInternal(id);
  };

  public query ({ caller }) func getLayoutsByUser(user : Principal) : async [HouseLayout] {
    layouts.values().toArray().filter(func(layout) { layout.owner == user }).sort();
  };

  public query ({ caller }) func searchLayoutsByName(name : Text) : async [HouseLayout] {
    layouts.values().toArray().filter(func(layout) { layout.name.contains(#text name) }).sort();
  };

  public shared ({ caller }) func createLayout(
    name : Text,
    plot : PlotDimensions,
    floors : Nat,
    rooms : [Room],
    amenities : [Amenity]
  ) : async Nat {
    let id = nextId;
    let layout : HouseLayout = {
      id;
      owner = caller;
      name;
      plot;
      floors;
      rooms;
      amenities;
      created = Time.now();
    };
    layouts.add(id, layout);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func updateLayout(id : Nat, layout : HouseLayout) : async () {
    let existing = getLayoutInternal(id);
    if (existing.owner != caller) {
      Runtime.trap("Unauthorized");
    };
    let updatedLayout : HouseLayout = {
      id;
      owner = caller;
      name = layout.name;
      plot = layout.plot;
      floors = layout.floors;
      rooms = layout.rooms;
      amenities = layout.amenities;
      created = existing.created;
    };
    layouts.add(id, updatedLayout);
  };

  public shared ({ caller }) func deleteLayout(id : Nat) : async () {
    let layout = getLayoutInternal(id);
    if (layout.owner != caller) {
      Runtime.trap("Unauthorized");
    };
    layouts.remove(id);
  };
};
