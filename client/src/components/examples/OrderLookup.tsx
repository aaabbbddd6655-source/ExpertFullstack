import OrderLookup from "../OrderLookup";

export default function OrderLookupExample() {
  return (
    <OrderLookup 
      onLookup={(phone, orderNumber) => {
        console.log("Looking up order:", { phone, orderNumber });
      }}
    />
  );
}
