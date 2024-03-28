import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat, vconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
    const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'Minimal Three',
    });
    const dataset = config.addDataset('My dataset').addFile({
        fileType: 'image.ome-tiff',
        // url:'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/img_0002.ome.tiff',
        // url:'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/im001.ome.tiff',
        // url:'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T153200Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=730bc41956023dea02cba32f58a9c4345e3d258da0480c12d09e1105eeaa7ee4',
       // url:'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGYaCXVzLWVhc3QtMSJHMEUCIQCfIIIeB%2FtzE4EbQQWAiYmBWLcSb9rp3sDqupxr0xPvowIgFulnJRvC9nHrMdy5Sob6oW7nTp%2F13wC6%2Fh2RfgisR84q7AMIfhABGgwxMzY1NzY1MjIwNDgiDKEAJrf9qqlonexSFSrJA6%2BSbTEoy9ty%2FyGwkhny3Sa8ZsMpDEd780Hbythc1QZl8Oh8w4AAl0yJOSIbT1ep4wkLYi6AbzCf6BaiJkiGEEXsvkru870Z1IcB9OKoNS9TMltOjZu%2BvAqZ3tHtlJgz7dltMkVtiCbEQt5AKc5OIW22ZHKq0YlcG2EVcz%2BGjjOMsTJdQKhURfpw9IRDtLME6IF9jhHXBMXg%2FW%2BwOHkSIYRwjZz2dDKySdFeoYDne1sH0xTsewdKcX8a5fZQhyKFHQXNaJIQsh%2B0xl1%2F%2BoHh2X9je31EjOhMOnpJ4ynRkAyx3IGVcYbFMu3a1nayUhOzspat0wZAJ08I2sjoo2bGKRXJ%2F%2Fmz72Dj6WWm9bbfp4enfi1sNC%2Fy8nFhApX7dMHzkK6fCnC5E1gtiA2T8rS5hbwy%2BdvBxOzY%2B6w2RQjgPjQLmwX5cdzIdKk3nHC%2FkP69hbUhNo4mgW%2F55eUcL20w%2Bo0V45hHddlh6S%2FvR6CoVlpteBQuUdCvdiFI2v5zfMdMCigaJc50K%2BalXRf0hkh2LSNSSwTjXxkllBi8Xz6vONHTTPRjYyTaG%2Fe3xmMKrvwrLjnXm9MdtbLJ3D3wPwrCd7r2GOrSQTM5b30wo7CCsAY6lAIXDHzhjHefoYHpgKEbWxt4ezU52XIzkLmbQudxwSWHiUbw6%2B7yJUVVNSWtY8y9tFOpiw7yELqUr9W%2Bc%2FPF1%2FdG9%2F5RPWNIVRSYr4TFefCrYr54a7LRCH%2FASo6U%2B3%2FeKqNkTHfUnG0XiPQ140wZq1CEa6q%2BP%2BwysB1VwcOmdIVpctcfCnk2TVRbkow2I4vD7AAHUU3hs9vRXDaMtCshNLR8YmKPWWzi%2B4m%2B8Qn2w03lio7fuZAeE7HLKHgyPoFrtAs%2F%2B8uDA9TxfSTAkNHXoBwoTUsFzNEXPEZh%2B%2BrdJw2keHUK3%2Bqiu2JgpWHHz9oUD4Y5k5YEotaIpwa%2F0qf3f6ojwdSGGSi8CGyAcviiypXnG6emsYg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240324T211830Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADSK2YTA5%2F20240324%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=54741ea19fc4ddebbdb5bc1fe66fac5cabdab0ac215066f2bcd799575ff2074d',
       // url:'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/5x.ome.tiff?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGoaCXVzLWVhc3QtMSJGMEQCIDdi2S%2F7oFNEechH4gXMpYuxnLS3cr2eCaT7k2pXxviPAiBwUi%2BlcnSbtN6A5%2BxTN0SB9rZ7Cy1QtMZOoEReyWxNlyr1AwiD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIM77Qoh%2FUrpZH81rsMKskDKnxOuQSZWGH1u7RyTgJlaAG%2B2Ec%2FwHj%2BHijNsFsCWpO%2BDzYLtsYI%2Bi8Hh0XtNXrRiK1yCnzJioaWm1ZSXSQVM9m6C7WIeL48c4Q5E%2Bm%2Fud9LJgzWQ15TXgehv1T7v6moVZx6tUtf2lYnFnq312STQSIsi7fEVAIXx1a%2F9n%2Fq3CiltwkHnNKMV6QbgFc6RZJPUzwpjgRK%2FsNrIq9g8J2pucXIJEAdW%2FXD9WS1ORHtABMs0Pre3zwEhA1Sn2HUVmm%2FsyVsRzgP5PXnEqXSfxqVKyTwzSnaTC0lgJhw4fMxE389LS6SGi3c%2FA9khYwVUJRCT6u4ez0pQyLgeTx%2B4Rv0bLXfsYWTbVd0u5QfoWlIsHMU6N4QqGYMlkVqXPGbp504ePNSPj8R6xJR4Nj3r6CfJd1XNOnEDf77wLKStLnEXF0ko6bpavkYQh0cOnD%2FOFmNTUhGR0Y4APwcI%2FMWcL1ar2bUy9tJS%2BBoHc6SjAa%2Fm0c7U2XCRbxHBAhg5CtDWhXtVte6Unkon02OlX7jFeKNYBG4QsCwSs4i1XLU2rpd6ApmVAQAnRaQhAGDX1V4blO27ZcNPe5eQBUZdbDVpygxGuE91uU9lTztNTDAsYOwBjqVAh%2FUaihIyz1T0DbRzcRomU60RdQenhqkMgQlygXjEaZK1zIS%2FIyKsPbhM6Oh5u5MRQoest44EcChb27UuxFYDGu%2B3kllwimASYTahgESXYCtf04%2FYe5tPjTufrbONaBUk7zpws1pOYty%2BKXO82mGZMLXyB2mxLhuNlwBxY2GWuQGKTOc5x81u1AbSstXRyfiREyHRFFIFDriQKN6bdEmGOqj%2F0Ga%2Bh%2B%2B%2BvbETSxJpN7nog%2FAtX92SG1vMvEJqx94vEO%2B0Gc4P%2BSqYN5ZovJtKRWNDM0AyjP2OuwjN7wY9l1CKO8%2BtanZvDCQSQE7TpxNJ22mxJY3ZpXbWwPSPRQ53aBZ%2FZ7lWfrF7HkSNU4luEqhY23hJo4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240325T020300Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEBUEFUHK%2F20240325%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7bf37f4323a8bcf09b6fa04f6b257233a48ebe9337f3ec5c07974b16862b35f2',
        url: 'https://vitessce-data-v2.s3.amazonaws.com/data/sorger/bloodVessel_bigger.ome.tiff',
        options: {
            // offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/img_0002.offsets.json",
            // offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/im001.offsets.json",
            // offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJHMEUCIEo8jFefVVt0XT2i8mhEQUljNtqGnKUaRfTigUgbrXywAiEAi1hSnGABFvnhtAlh1KQgCZvtdLV0So0WIh%2FGhhLofP0q7AMIMBABGgwxMzY1NzY1MjIwNDgiDN0i4pxPav96vq8GoSrJA%2BXt2OvWVonQwJR8Gf4oKFWipg5Eu9M6EU4I4NXfzlYJiNTWZRJLC6mZjIWEev2bBZ8%2FNdqazK%2BwdzMJKqgqITBZSEgKx6nQ78%2BJXReZ4b7UuEDR%2FTauBnuGHO5I8MrnXvZYSyP8P%2FB4qmdm6jRPw2baQPDVV0Gd%2FkZaiQ%2FecVccw1c%2FWdmBqqA6iNveumgei5yA9Lm4Ll0zc8ZjkqEIVXageVXw1FRxGeEvQejcBCgbB01Qha3rQFA1t0czzTNqTJrqOaLA597gy6Oy%2FIsRq8vA3ZTnKOt%2BJ2elSxPaDHuY1Mt8FAvd%2BcGWWCd8M1SmwaQGRBzDHEBwHewxWzMGMTbaSLOpdOo4fDiYqS4pz0P%2FlhfJBO8yinrVr98gFF8MBlgyoJ5QdB%2BqxErdYozOEBZ3n8iwoPx2cQbvTw9pytMMlDb%2F0UmTMmaJIKso%2F69pAfUXIugRwON%2BJMuL3ZI4%2BNMV%2BWK%2BbcsEWPQMVw%2BUISYnlcn3CtrKJsw0O21N4MD53Qunr9JTa4l7sOPLXLzFaxy%2FlT3nNxNvqRYm%2BY01crrlZFvu3eDpk1Vk3DQgxyP3NesGW6OtvhQsnYa7zanCZiziCCsCV6bkweYwn6DxrwY6lAImCx8EC%2BEPfUaTkPur4XPEPMM85Tw%2BA4Q%2BdaCkjARzPj5qO2lP3y%2B3O51%2FPQMx6xEFxXkuvT7IwBgJREhLWDjq0i%2By5KtFDhF1Pi4aDJsW1WFa1DciVKA5puGM1umzIZQiFHyUDFvZIF%2BhOaXFAV9pCjEsXg0eOM3tm35PACnWUUp8mRz7CBTFbheVXE8UiEARx%2BtsisykFkY%2FDnUmMFH1f%2F0rv2OvJSvwKAgURA%2BRPBIGxJzNN146E1xTZO2gBJ%2B8krKMpn1t7PgP237aKi3a2fxPjmNjkG4VYp4%2FDe%2BQo8X%2F7TEKQLBod54UP2%2BvQt%2FEydnbNK9DGq1uIZgHc%2BbEyEvVT8%2BNE%2BBBG8Iy1n6zAscj%2F00%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240321T153237Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEO2WZPUH%2F20240321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=520d3101f716499c740739f7815db3d33f0ddd018a2fbca3bba9e5de46c2b1ae",
        //    offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGYaCXVzLWVhc3QtMSJHMEUCIQCfIIIeB%2FtzE4EbQQWAiYmBWLcSb9rp3sDqupxr0xPvowIgFulnJRvC9nHrMdy5Sob6oW7nTp%2F13wC6%2Fh2RfgisR84q7AMIfhABGgwxMzY1NzY1MjIwNDgiDKEAJrf9qqlonexSFSrJA6%2BSbTEoy9ty%2FyGwkhny3Sa8ZsMpDEd780Hbythc1QZl8Oh8w4AAl0yJOSIbT1ep4wkLYi6AbzCf6BaiJkiGEEXsvkru870Z1IcB9OKoNS9TMltOjZu%2BvAqZ3tHtlJgz7dltMkVtiCbEQt5AKc5OIW22ZHKq0YlcG2EVcz%2BGjjOMsTJdQKhURfpw9IRDtLME6IF9jhHXBMXg%2FW%2BwOHkSIYRwjZz2dDKySdFeoYDne1sH0xTsewdKcX8a5fZQhyKFHQXNaJIQsh%2B0xl1%2F%2BoHh2X9je31EjOhMOnpJ4ynRkAyx3IGVcYbFMu3a1nayUhOzspat0wZAJ08I2sjoo2bGKRXJ%2F%2Fmz72Dj6WWm9bbfp4enfi1sNC%2Fy8nFhApX7dMHzkK6fCnC5E1gtiA2T8rS5hbwy%2BdvBxOzY%2B6w2RQjgPjQLmwX5cdzIdKk3nHC%2FkP69hbUhNo4mgW%2F55eUcL20w%2Bo0V45hHddlh6S%2FvR6CoVlpteBQuUdCvdiFI2v5zfMdMCigaJc50K%2BalXRf0hkh2LSNSSwTjXxkllBi8Xz6vONHTTPRjYyTaG%2Fe3xmMKrvwrLjnXm9MdtbLJ3D3wPwrCd7r2GOrSQTM5b30wo7CCsAY6lAIXDHzhjHefoYHpgKEbWxt4ezU52XIzkLmbQudxwSWHiUbw6%2B7yJUVVNSWtY8y9tFOpiw7yELqUr9W%2Bc%2FPF1%2FdG9%2F5RPWNIVRSYr4TFefCrYr54a7LRCH%2FASo6U%2B3%2FeKqNkTHfUnG0XiPQ140wZq1CEa6q%2BP%2BwysB1VwcOmdIVpctcfCnk2TVRbkow2I4vD7AAHUU3hs9vRXDaMtCshNLR8YmKPWWzi%2B4m%2B8Qn2w03lio7fuZAeE7HLKHgyPoFrtAs%2F%2B8uDA9TxfSTAkNHXoBwoTUsFzNEXPEZh%2B%2BrdJw2keHUK3%2Bqiu2JgpWHHz9oUD4Y5k5YEotaIpwa%2F0qf3f6ojwdSGGSi8CGyAcviiypXnG6emsYg%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240324T211841Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ADSK2YTA5%2F20240324%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2b97c65ccb92dfc8767193e9728825c614049f115dc3d77b741545939e80f2a3",
           // offsetsUrl: "https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_7/5x/5x.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGoaCXVzLWVhc3QtMSJGMEQCIDdi2S%2F7oFNEechH4gXMpYuxnLS3cr2eCaT7k2pXxviPAiBwUi%2BlcnSbtN6A5%2BxTN0SB9rZ7Cy1QtMZOoEReyWxNlyr1AwiD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDEzNjU3NjUyMjA0OCIM77Qoh%2FUrpZH81rsMKskDKnxOuQSZWGH1u7RyTgJlaAG%2B2Ec%2FwHj%2BHijNsFsCWpO%2BDzYLtsYI%2Bi8Hh0XtNXrRiK1yCnzJioaWm1ZSXSQVM9m6C7WIeL48c4Q5E%2Bm%2Fud9LJgzWQ15TXgehv1T7v6moVZx6tUtf2lYnFnq312STQSIsi7fEVAIXx1a%2F9n%2Fq3CiltwkHnNKMV6QbgFc6RZJPUzwpjgRK%2FsNrIq9g8J2pucXIJEAdW%2FXD9WS1ORHtABMs0Pre3zwEhA1Sn2HUVmm%2FsyVsRzgP5PXnEqXSfxqVKyTwzSnaTC0lgJhw4fMxE389LS6SGi3c%2FA9khYwVUJRCT6u4ez0pQyLgeTx%2B4Rv0bLXfsYWTbVd0u5QfoWlIsHMU6N4QqGYMlkVqXPGbp504ePNSPj8R6xJR4Nj3r6CfJd1XNOnEDf77wLKStLnEXF0ko6bpavkYQh0cOnD%2FOFmNTUhGR0Y4APwcI%2FMWcL1ar2bUy9tJS%2BBoHc6SjAa%2Fm0c7U2XCRbxHBAhg5CtDWhXtVte6Unkon02OlX7jFeKNYBG4QsCwSs4i1XLU2rpd6ApmVAQAnRaQhAGDX1V4blO27ZcNPe5eQBUZdbDVpygxGuE91uU9lTztNTDAsYOwBjqVAh%2FUaihIyz1T0DbRzcRomU60RdQenhqkMgQlygXjEaZK1zIS%2FIyKsPbhM6Oh5u5MRQoest44EcChb27UuxFYDGu%2B3kllwimASYTahgESXYCtf04%2FYe5tPjTufrbONaBUk7zpws1pOYty%2BKXO82mGZMLXyB2mxLhuNlwBxY2GWuQGKTOc5x81u1AbSstXRyfiREyHRFFIFDriQKN6bdEmGOqj%2F0Ga%2Bh%2B%2B%2BvbETSxJpN7nog%2FAtX92SG1vMvEJqx94vEO%2B0Gc4P%2BSqYN5ZovJtKRWNDM0AyjP2OuwjN7wY9l1CKO8%2BtanZvDCQSQE7TpxNJ22mxJY3ZpXbWwPSPRQ53aBZ%2FZ7lWfrF7HkSNU4luEqhY23hJo4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240325T020233Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5AEBUEFUHK%2F20240325%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b29a3fc4fc3304622411f7eeec15a3940f9cc7dc2cf6bf18fcbf2210fadc23e6",
            offsetsUrl: "https://vitessce-data-v2.s3.amazonaws.com/data/sorger/bloodVessel_bigger.offsets.json",
        },
         coordinationValues: {
             fileUid: 'kidney',
         },
    })




    const spatialThreeView = config.addView(dataset, 'spatialThree');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    config.linkViewsByObject([spatialThreeView, lcView], {
        spatialTargetZ: 0,
        spatialTargetT: 0,
        //spatialRenderingMode:'3D',
        imageLayer: CL([
            {
                fileUid: 'kidney',
                spatialLayerOpacity: 1,
                spatialTargetResolution: null,
                imageChannel: CL([
                    {
                        spatialTargetC: 0,
                        spatialChannelColor: [0, 255, 0],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1.0,
                        spatialChannelWindow: null,
                    },
                    // {
                    //     spatialTargetC: 2,
                    //     spatialChannelColor: [0, 0, 255],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: null,
                    // },
                    // {
                    //     spatialTargetC: 0,
                    //     spatialChannelColor: [255, 0, 0],
                    //     spatialChannelVisible: true,
                    //     spatialChannelOpacity: 1.0,
                    //     spatialChannelWindow: null,
                    // },
                ]),
            },
        ])
    });

    config.layout(hconcat(spatialThreeView, lcView));

    const configJSON = config.toJSON();
    return configJSON;
}

export const threeMinimal = generateThreeMinimalConfiguration();
