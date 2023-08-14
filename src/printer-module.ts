import fs from "fs";
import path from "path";
import * as env from "dotenv";
const escpos = require("escpos");
import { Logger } from "./config";
escpos.USB = require("escpos-usb");
import * as qrimage from "qr-image";
const _ = require("escpos/commands");
import { format, receiptRowText } from "./utils";

env.config();

const receipt = (body: any, cb: Function) => {
  try {
    // Search devices
    const device = new escpos.USB();
    // Setup the printer service
    const printer = new escpos.Printer(device, { encoding: "utf8" });

    // Generate QR image
    var png = qrimage.image("http://137.184.53.63:5571/", { type: "png" });

    let qrPath = path.join(__dirname, "../upload/images/qr/tra_qr_image.png");
    png.pipe(fs.createWriteStream(qrPath));

    device.open(async (error: any) => {
      Logger.error(error);
      printer
        .align("ct")
        .font("a")
        .style("normal")
        .size(0.05, 0.05)
        .text(body["BrandName"])
        .text(body["AddressLocation"]);

      // TAX INVOICE, ORIGINAL
      if (body["Status"] == 0 && body["CreditNote"] == false) {
        printer
          .style("b")
          .size(0.5, 0.5)
          .text("")
          .text("ORDER RECEIPT")
          .style("a");
      }
      // TAX INVOICE, COPY
      else if (body["Status"] > 0 && body["CreditNote"] == false) {
        printer
          .style("b")
          .size(0.5, 0.5)
          .text("NOT A LEGAL RECEIPT")
          .text("TAX INVOICE COPY")
          .style("a");
      }
      // CREDIT NOTE, ORIGINAL
      else if (body["Status"] == 0 && body["CreditNote"] == true) {
        printer
          .style("b")
          .size(0.5, 0.5)
          .text("CREDIT NOTE ORIGINAL")
          .style("a")
          .text(`ORG CU INVOICE NO: ${body["OriginalInvoiceNumber"]}`);
      }
      // CREDIT NOTE, COPY
      else if (body["Status"] > 0 && body["CreditNote"] == true) {
        printer
          .style("b")
          .size(0.5, 0.5)
          .text("NOT A LEGAL RECEIPT")
          .text("CREDIT NOTE COPY")
          .style("a")
          .text(
            `ORG CU INV NO: ${body["SdcId"]}/${body["OriginalInvoiceNumber"]}`
          );
      }

      printer
        .text(receiptRowText("CLIENT PIN:", `${body["ClientPin"]}`, 48))
        .text(receiptRowText("CLIENT NAME:", `${body["ClientName"]}`, 48))
        .text("------------------------------------------------");
      let items: any[] = body["Items"];
      for (let i = 0; i < items.length; i++) {
        let credited = body["CreditNote"] == true ? "-" : "";
        printer
          .text(receiptRowText(`${items[i]["ProductName"]}`, ``, 48))
          .text(
            receiptRowText(
              `${credited + items[i]["Quantity"]} X ${format.currency(
                items[i]["UnitTotalCash"],
                2
              )}`.split(".")[0],
              `${
                credited +
                format.currency(items[i]["TotalCash"], 2).split(".")[0]
              } ${items[i]["vate_rate"]}`,
              48
            )
          );
        if (items[i]["Discount"] > 0) {
          printer.text(
            receiptRowText(
              `DISCOUNT: ${credited + items[i]["Quantity"]} X ${
                items[i]["Discount"]
              } `,
              `-${items[i]["TotalDiscount"]}`.split(".")[0],
              48
            )
          );
        }
      }
      printer
        .text("------------------------------------------------")
        .text(
          receiptRowText(
            "TAXABLE A-EX",
            `${
              body["TaxblAmtA"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxblAmtA"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TAXABLE B-16%",
            `${
              body["TaxblAmtB"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxblAmtB"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TAXABLE C-0%",
            `${
              body["TaxblAmtC"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxblAmtC"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TAXABLE D-NON VAT",
            `${
              body["TaxblAmtD"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxblAmtD"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TAXABLE E-8%",
            `${
              body["TaxblAmtE"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxblAmtE"], 2)}`,
            48
          )
        );
      printer
        .text("------------------------------------------------")
        .text(
          receiptRowText(
            "TOTAL TAX A-EX",
            `${
              body["TaxAmtA"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxAmtA"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TOTAL TAX B-16%",
            `${
              body["TaxAmtB"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxAmtB"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TOTAL TAX C-0%",
            `${
              body["TaxAmtC"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxAmtC"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TOTAL TAX D-NON VAT",
            `${
              body["TaxAmtD"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxAmtD"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TOTAL TAX E-8%",
            `${
              body["TaxAmtE"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TaxAmtE"], 2)}`,
            48
          )
        )
        .text(
          receiptRowText(
            "TOTAL TAX",
            `${
              body["TotTaxAmt"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TotTaxAmt"], 2)}`,
            48
          )
        );
      if (body["CatLevy"] > 0) {
        printer.text(
          receiptRowText(
            "CATERING LEVY 2%",
            `${
              body["CatLevy"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["CatLevy"], 2)}`,
            48
          )
        );
      }
      if (body["ServiceCharge"] > 0) {
        printer.text(
          receiptRowText(
            "SERVICE CHARGE 10%",
            `${
              body["ServiceCharge"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["ServiceCharge"], 2)}`,
            48
          )
        );
      }
      if (body["CatLevy"] > 0 || body["ServiceCharge"] > 0) {
        printer.text(
          receiptRowText(
            "TOTAL CHARGE",
            `${
              body["TotTaxAmt"] > 0 && body["CreditNote"] == true ? "-" : ""
            }${format.currency(body["TotalCharge"], 2)}`,
            48
          )
        );
      }
      printer
        .text("------------------------------------------------")
        .text(
          receiptRowText(
            "CASH :",
            `${body["CreditNote"] == true ? "-" : ""}${format.currency(
              body["AmountPaid"],
              2
            )}`.split(".")[0],
            48
          )
        );
      if (body["Discount"] > 0) {
        printer.text(
          receiptRowText(
            `DISCOUNT: `,
            `${format.currency(body["TotalDiscount"], 2)}`.split(".")[0],
            48
          )
        );
      }
      printer
        .text("------------------------------------------------")
        .text(receiptRowText("ITEM NUMBER:", `${body["ItemNumber"]}`, 48))
        .text("------------------------------------------------")

        .text(receiptRowText("RECEIPT NUMBER:", `${body["InvoiceNumber"]}`, 48))
        .text(
          receiptRowText("DATE:", `${body["SdcDate"]} ${body["SdcTime"]}`, 48)
        )
        .text("------------------------------------------------")
        .style("normal")
        .size(1, 1)
        .style("b")
        .size(0.05, 0.05)
        .style("normal")
        .text("*** END OF ORDER RECEIPT ***")
        .text("")
        .text("")
        .cut()
        .close();
      setTimeout(() => {
        cb(null, "Receipt Printed.");
      }, 1000);
    });
  } catch (error) {
    Logger.error(error);
  }
};

export const zreport = (body: any, cb: Function) => {
  try {
    // Search devices
    const device = new escpos.USB();

    // Setup the printer service
    const printer = new escpos.Printer(device, { encoding: "utf8" });
    const receiptVerificationImagePath = path.join(__dirname, "tra_logo.png");

    // escpos.Image.load(receiptVerificationImagePath, function (image: any) {
    device.open(async (error: any) => {
      if (error) {
        printer.close();
        cb(error, null);
      } else {
        printer.align("ct");
        // .image(image, "d24")
        // .then(() => {
        printer
          .size(0.05, 0.05)
          .text(body["BrandName"])
          .text(body["AddressLocation"])
          .text("PIN: " + body["Pin"])
          .text("CU: " + body["Cu"])
          .text("")
          .text(
            receiptRowText(`DATE: ${body["Date"]}`, `TIME: ${body["Time"]}`, 48)
          )
          .text("................................................")
          .style("b")
          .text("DAILY Z REPORT")
          .style("normal")
          .text("................................................")
          .style("b")
          .text(receiptRowText("CURRENT Z", `${body["CurrentZ"]}`, 48))
          .style("normal")
          .text(receiptRowText("PREVIOUS Z", `${body["PreviousZ"]}`, 48))
          .text("................................................")
          .text(receiptRowText("DISCOUNTS", `${body["Discounts"]}`, 48))
          .text(receiptRowText(`AMOUNT`, `${body["DiscountsAmount"]}`, 48))
          .text(receiptRowText(`MARK UPS`, `0.00`, 48))
          .text(receiptRowText(`AMOUNT`, `0.00`, 48))
          .text(receiptRowText(`MONEY`, `${body["DailyAmount"]}`, 48))
          .text("................................................")
          .text(
            receiptRowText(`FIRST RECEIPT`, `${body["FirstReceiptTime"]}`, 48)
          )
          .text(
            receiptRowText(`LAST RECEIPT`, `${body["LastReceiptTime"]}`, 48)
          )
          .text(
            receiptRowText(`RECEIPT ISSUED`, `${body["ReceiptIssued"]}`, 48)
          )
          .text(receiptRowText(`TOTAL`, `${body["DailyAmount"]}`, 48))

          .text("................................................")
          .style("b")
          .text("PAYMENTS REPORT")
          .style("normal")
          .text("................................................")
          .text(receiptRowText(`CASH`, `${body["CashAmount"]}`, 48))
          .text(receiptRowText(`CHEQUE`, `${body["ChequeAmount"]}`, 48))
          .text(receiptRowText(`CREDIT CARD`, `${body["CcardAmount"]}`, 48))
          .text(receiptRowText(`EMONEY`, `${body["EmoneyAmount"]}`, 48))
          .text(receiptRowText(`INVOICE`, `${body["InvoiceAmount"]}`, 48))
          .text(receiptRowText(`TOTAL`, `${body["DailyAmount"]}`, 48))
          .text("................................................")
          .style("b")
          /** */
          .text("TAX REPORT")
          .style("normal")
          .text("................................................")
          .text(receiptRowText(`1: TAX A (18%)`, ``, 48))
          .text(receiptRowText(`TURNOVER`, `0.00`, 48))
          .text(receiptRowText(`NET SUM`, `0.00`, 48))
          .text(receiptRowText(`TAX`, `0.00`, 48))

          .text(receiptRowText(`2: TAX B (0%)`, ``, 48))
          .text(receiptRowText(`TURNOVER`, `0.00`, 48))
          .text(receiptRowText(`NET SUM`, `0.00`, 48))
          .text(receiptRowText(`TAX`, `0.00`, 48))

          .text(receiptRowText(`3: TAX C (0%)`, ``, 48))
          .text(receiptRowText(`TURNOVER`, `0.00`, 48))
          .text(receiptRowText(`NET SUM`, `0.00`, 48))
          .text(receiptRowText(`TAX`, `0.00`, 48))

          .text(receiptRowText(`4: TAX D (0%)`, ``, 48))
          .text(receiptRowText(`TURNOVER`, `0.00`, 48))
          .text(receiptRowText(`NET SUM`, `0.00`, 48))
          .text(receiptRowText(`TAX`, `0.00`, 48))

          .text(receiptRowText(`5: TAX E (EX)`, ``, 48))
          .text(receiptRowText(`TURNOVER`, `${body["DailyAmount"]}`, 48))
          .text(
            receiptRowText(
              `TOTAL:`,
              `-----------------------------------------`,
              48
            )
          )
          .text(receiptRowText(`TURNOVER (A+B+C+D)`, `0.00`, 48))
          .text(receiptRowText(`NET SUM (A+B+C+D)`, `0.00`, 48))
          .text(receiptRowText(`TAX (A+B+C+D)`, `0.00`, 48))
          .text(receiptRowText(`TURNOVER (SR)`, `0.00`, 48))
          .text(receiptRowText(`TURNOVER (EX)`, `${body["DailyAmount"]}`, 48))
          .text(receiptRowText(`TURNOVER TOTAL`, `${body["DailyAmount"]}`, 48))
          .text("************************************************")
          .style("b")

          /** */
          .text("FM SUMMARY")
          .style("normal")
          .text(receiptRowText(`TOTAL GROSS*A`, `0.00`, 48))
          .text(receiptRowText(`TOTAL NET*A`, `0.00`, 48))
          .text(receiptRowText(`TOTAL GROSS*B`, `0.00`, 48))
          .text(receiptRowText(`TOTAL NET*B`, `0.00`, 48))
          .text(receiptRowText(`TOTAL GROSS*C`, `0.00`, 48))
          .text(receiptRowText(`TOTAL NET*C`, `0.00`, 48))
          .text(receiptRowText(`TOTAL GROSS*SR`, `0.00`, 48))
          .text(receiptRowText(`TOTAL GROSS*EX`, `${body["GrossTotal"]}`, 48))
          .text("************************************************")
          .text("................................................")
          /** */
          // .text("*** END OF LEGAL RECEIPT ***")
          .text("")
          .cut()
          .close();
        setTimeout(() => {
          cb(null, "Receipt Printed.");
        }, 1000);
        // });
      }
    });
    // });
  } catch (error) {
    Logger.error(error);
  }
};

export const print = { receipt, zreport };
