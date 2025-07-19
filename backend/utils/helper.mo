import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Blob "mo:base/Blob";

import TypCommon "../common/type";

module {
    public func hasAnyTag(haystack : [TypCommon.Tags], needle : [TypCommon.Tags]) : Bool {
        for (h in Iter.fromArray(haystack)) {
            if (Array.find<TypCommon.Tags>(needle, func(n) = n == h) != null) {
                return true;
            };
        };
        return false;
    };

    public func natToBlob(n : Nat) : Blob {
        if (n == 0) {
            return Blob.fromArray([0]);
        };

        var x = n;
        let bytes = Buffer.Buffer<Nat8>(0);

        while (x > 0) {
            let byte = Nat8.fromIntWrap(x % 256);
            bytes.add(byte);
            x /= 256;
        };

        let arr = Array.reverse<Nat8>(Buffer.toArray(bytes));

        return Blob.fromArray(arr)
    };
}