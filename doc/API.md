# STOCKLINE API

## Vytvoření dokladu

```http
POST /receipts
```

### Dodací list

Dodací list (`DeliveryNote`) slouží k převodu zboží z jedné prodejny do druhé.

Vytvořením dodacího listu se z prodejny odepíše převáděné množství zboží. Zároveň tento dodací list slouží jako podklad
pro příjem na cílové prodejně.

Payload

```json
{
  "type": "DeliveryNote",
  "warehouseId": "507f1f77bcf86cd7994390EF",
  "destinationStoreId": "507f1f77bcf86cd799439DR7S",
  "goodsReceivedNoteId": "507f1f77bcf8gr97994390EF",
  "items": [
    {
      "variantId": "507f1frs8cf86cd7994390EF",
      "quantity": 3
    }
  ]
}
```

Kde:

* `type` Typ dokladu (vždy `DeliveryNote`)
* `warehouseId` ID skladu (pouze u _Wholesale_)
* `destinationStoreId` ID cílové prodejny
* `items` Seznam zboží
* `items`.`variantId` ID varianty produktu
* `items`.`quantity` Počet kusů
