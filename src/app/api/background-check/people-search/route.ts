import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';

const ACCOUNT_ID = process.env.SEARCHBUG_ACCOUNT_ID;
const PASSWORD = process.env.SEARCHBUG_PASSWORD + '$z';
const BASE_URL = 'https://data.searchbug.com/api/search.aspx';

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const queryParams = new URLSearchParams({
    CO_CODE: ACCOUNT_ID!,
    PASS: PASSWORD!,
    TYPE: 'api_ppl',
    FORMAT: 'JSON',
  });

  // Only add first name, last name, and date of birth
  if (body.firstName) queryParams.append('FNAME', body.firstName);
  if (body.lastName) queryParams.append('LNAME', body.lastName);
  if (body.dob) queryParams.append('DOB', body.dob);

  const url = `${BASE_URL}?${queryParams.toString()}`;
  console.log(url);
  console.log(PASSWORD);
  console.log(ACCOUNT_ID);

  try {
    // const response = await fetch(url);
    // const data = await response.json();
    console.log(sampleData);
    const response = sampleData;
    const personReport = await prisma.personReport.create({
      data: {
        userId: userId,
        firstName: response.people.person.names.name[0].firstName,
        lastName: response.people.person.names.name[0].lastName,
        dateOfBirth: response.people.person.DOBs.DOB,
        city: response.people.person.addresses.address[0].city,
        state: response.people.person.addresses.address[0].state,
        reportToken: response.people.person.reportToken,
        bankruptcies: +response.people.person.bankruptcies,
        judgements: +response.people.person.judgements,
        liens: +response.people.person.liens,
        isSexOffender: response.people.person.sexOffender ? true : false,
      }
    });
    return NextResponse.json({ data: response, personReport });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  // Log the URL for verification
  // console.log(url);
  // return NextResponse.json({ message: 'URL logged for verification', url: url });
}



const sampleData = {
  rows: "1",
  people: {
    person: {
      "names": {
        "name": [
          {
            "lastName": "DOE",
            "firstName": "JOHN",
            "middleName": "X",
            "suffix": null,
            "firstDate": "06/01/2012",
            "lastDate": "07/04/2024"
          },
          {
            "lastName": "BENNETT",
            "firstName": "TYLER",
            "middleName": "TRAVIS",
            "suffix": null,
            "firstDate": "10/31/2018",
            "lastDate": "10/01/2020"
          },
          {
            "lastName": "BENNETT",
            "firstName": "TRAVIS",
            "middleName": "TYLER",
            "suffix": null,
            "firstDate": "06/01/2012",
            "lastDate": "06/21/2012"
          }
        ]
      },
      "akalist": {
        "AKA": [
          {
            "firstName": "TYLER",
            "middleName": "T",
            "lastName": "BENNETT"
          },
          {
            "firstName": "TYLER",
            "middleName": "TRAVIS",
            "lastName": "BENNETT"
          },
          {
            "firstName": "TRAVIS",
            "middleName": "TYLER",
            "lastName": "BENNETT"
          }
        ]
      },
      "deceased": "No",
      "DODs": null,
      "DOBs": {
        "DOB": "06/11/1993"
      },
      "addresses": {
        "address": [
          {
            "fullStreet": "4433 NE CRESTMOOR LN",
            "houseNumber": "4433",
            "preDirection": "NE",
            "streetName": "CRESTMOOR",
            "streetType": "LN",
            "postDirection": null,
            "apt": null,
            "city": "ANKENY",
            "county": "POLK",
            "state": "IA",
            "zip": "50021",
            "plusFour": "0002",
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": {
              "phone": [
                {
                  "phoneNumber": "7028488141",
                  "listingName": "TYLER BENNETT",
                  "phoneType": "Mobile",
                  "carrier": "T-MOBILE USA INC",
                  "carrierType": "WIRELESS",
                  "city": "LAS VEGAS",
                  "state": "NV",
                  "county": "CLARK",
                  "timeZone": "PT",
                  "listingType": "Unknown",
                  "possibleSubjectPhone": "Yes",
                  "toDate": "20240801",
                  "fromDate": "20140217"
                },
                {
                  "phoneNumber": "9454441560",
                  "listingName": "MELANIE JOHNSTON",
                  "phoneType": "ActiveLandLine",
                  "carrier": "T-MOBILE USA INC",
                  "carrierType": "WIRELESS",
                  "city": "GRAND PRAIRIE",
                  "state": "TX",
                  "county": "DALLAS",
                  "timeZone": "CT",
                  "listingType": "Unknown",
                  "possibleSubjectPhone": null,
                  "toDate": null,
                  "fromDate": null
                }
              ]
            },
            "confirmedAddress": null,
            "firstDate": "01/00/2024",
            "lastDate": "08/27/2024"
          },
          {
            "fullStreet": "5917 GREENDALE PL APT 204",
            "houseNumber": "5917",
            "preDirection": null,
            "streetName": "GREENDALE",
            "streetType": "PL",
            "postDirection": null,
            "apt": "204",
            "city": "JOHNSTON",
            "county": "POLK",
            "state": "IA",
            "zip": "50131",
            "plusFour": "2020",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "01/09/2023",
            "lastDate": "03/26/2024"
          },
          {
            "fullStreet": "5329 N CROWLEY LN # 1410AB",
            "houseNumber": "5329",
            "preDirection": "N",
            "streetName": "CROWLEY",
            "streetType": "LN",
            "postDirection": null,
            "apt": "1410AB",
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85705",
            "plusFour": "4943",
            "phonelist": null,
            "subdivisionName": "RILLITO LA CHOLLA",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "08/07/2023",
            "lastDate": "08/07/2023"
          },
          {
            "fullStreet": "250 N ARCADIA AVE APT 106",
            "houseNumber": "250",
            "preDirection": "N",
            "streetName": "ARCADIA",
            "streetType": "AVE",
            "postDirection": null,
            "apt": "106",
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85711",
            "plusFour": "3069",
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": {
              "phone": {
                "phoneNumber": "5204374307",
                "listingName": "MIKE MAJALCA",
                "phoneType": "ActiveLandLine",
                "carrier": "CELLCO PARTNERSHIP DBA VERIZON WIRELESS - AZ (VERIZON WIRELESS)",
                "carrierType": "WIRELESS",
                "city": "TUCSON",
                "state": "AZ",
                "county": "PIMA",
                "timeZone": "MT",
                "listingType": "Unknown",
                "possibleSubjectPhone": null,
                "toDate": null,
                "fromDate": null
              }
            },
            "confirmedAddress": null,
            "firstDate": "09/30/2014",
            "lastDate": "01/09/2023"
          },
          {
            "fullStreet": "2525 W ANKLAM RD APT 1410",
            "houseNumber": "2525",
            "preDirection": "W",
            "streetName": "ANKLAM",
            "streetType": "RD",
            "postDirection": null,
            "apt": "1410",
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85745",
            "plusFour": "3962",
            "subdivisionName": "TUCSON PARK WEST",
            "description": "1 office, 320 apartments",
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": {
              "phone": [
                {
                  "phoneNumber": "9282858048",
                  "listingName": "DAISY AHEDO",
                  "phoneType": "ActiveLandLine",
                  "carrier": "CELLCO PARTNERSHIP DBA VERIZON WIRELESS - AZ (VERIZON WIRELESS)",
                  "carrierType": "WIRELESS",
                  "city": "SOMERTON",
                  "state": "AZ",
                  "county": "YUMA",
                  "timeZone": "MT",
                  "listingType": "Unknown",
                  "possibleSubjectPhone": null,
                  "toDate": null,
                  "fromDate": null
                },
                {
                  "phoneNumber": "6238009164",
                  "listingName": "MOKSHI JOSHI",
                  "phoneType": "ActiveLandLine",
                  "carrier": "T-MOBILE USA INC",
                  "carrierType": "WIRELESS",
                  "city": "PHOENIX",
                  "state": "AZ",
                  "county": "MARICOPA",
                  "timeZone": "MT",
                  "listingType": "Unknown",
                  "possibleSubjectPhone": null,
                  "toDate": null,
                  "fromDate": null
                }
              ]
            },
            "confirmedAddress": null,
            "firstDate": "12/31/2022",
            "lastDate": "12/31/2022"
          },
          {
            "fullStreet": "7962 N GLEN DR APT 3049",
            "houseNumber": "7962",
            "preDirection": "N",
            "streetName": "GLEN",
            "streetType": "DR",
            "postDirection": null,
            "apt": "3049",
            "city": "IRVING",
            "county": "DALLAS",
            "state": "TX",
            "zip": "75063",
            "plusFour": "8031",
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": {
              "phone": {
                "phoneNumber": "4792249906",
                "listingName": "FNU SAMEENA",
                "phoneType": "ActiveLandLine",
                "carrier": "NEW CINGULAR WIRELESS PCS LLC - IL (AT&T MOBILITY)",
                "carrierType": "WIRELESS",
                "city": "CENTERTON",
                "state": "AR",
                "county": "BENTON",
                "timeZone": "CT",
                "listingType": "Unknown",
                "possibleSubjectPhone": null,
                "toDate": null,
                "fromDate": null
              }
            },
            "confirmedAddress": null,
            "firstDate": "01/13/2022",
            "lastDate": "01/13/2022"
          },
          {
            "fullStreet": "2569 HALL JOHNSON RD",
            "houseNumber": "2569",
            "preDirection": null,
            "streetName": "HALL JOHNSON",
            "streetType": "RD",
            "postDirection": null,
            "apt": null,
            "city": "GRAPEVINE",
            "county": "TARRANT",
            "state": "TX",
            "zip": "76051",
            "plusFour": "8717",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "01/29/2021",
            "lastDate": "01/29/2021"
          },
          {
            "fullStreet": "7917 DEBRA CT",
            "houseNumber": "7917",
            "preDirection": null,
            "streetName": "DEBRA",
            "streetType": "CT",
            "postDirection": null,
            "apt": null,
            "city": "OKLAHOMA CITY",
            "county": "OKLAHOMA",
            "state": "OK",
            "zip": "73132",
            "plusFour": "4329",
            "phonelist": null,
            "subdivisionName": "LOWERY EST",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "10/01/2020",
            "lastDate": "10/01/2020"
          },
          {
            "fullStreet": "1314 CUMING ST # 606",
            "houseNumber": "1314",
            "preDirection": null,
            "streetName": "CUMING",
            "streetType": "ST",
            "postDirection": null,
            "apt": "606",
            "city": "OMAHA",
            "county": "DOUGLAS",
            "state": "NE",
            "zip": "68102",
            "plusFour": "4414",
            "phonelist": null,
            "subdivisionName": "UNION PACIFIC PLACE REP",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "10/30/2019",
            "lastDate": "10/01/2020"
          },
          {
            "fullStreet": "111 E 4TH ST",
            "houseNumber": "111",
            "preDirection": "E",
            "streetName": "4TH",
            "streetType": "ST",
            "postDirection": null,
            "apt": null,
            "city": "LOVELAND",
            "county": "LARIMER",
            "state": "CO",
            "zip": "80537",
            "plusFour": "5501",
            "phonelist": null,
            "subdivisionName": "CITY LOVELAND",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "10/31/2018",
            "lastDate": "10/01/2020"
          },
          {
            "fullStreet": "111 E 4TH ST # 306",
            "houseNumber": "111",
            "preDirection": "E",
            "streetName": "4TH",
            "streetType": "ST",
            "postDirection": null,
            "apt": "306",
            "city": "LOVELAND",
            "county": "LARIMER",
            "state": "CO",
            "zip": "80537",
            "plusFour": "5501",
            "phonelist": null,
            "subdivisionName": "CITY LOVELAND",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "06/13/2019",
            "lastDate": "06/13/2019"
          },
          {
            "fullStreet": "5834 E BAKER ST",
            "houseNumber": "5834",
            "preDirection": "E",
            "streetName": "BAKER",
            "streetType": "ST",
            "postDirection": null,
            "apt": null,
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85711",
            "plusFour": "2410",
            "phonelist": null,
            "subdivisionName": "MITMAN",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "12/14/2017",
            "lastDate": "12/14/2017"
          },
          {
            "fullStreet": "443 CHAPLAIN MAGSIG AVE",
            "houseNumber": "443",
            "preDirection": null,
            "streetName": "CHAPLAIN MAGSIG",
            "streetType": "AVE",
            "postDirection": null,
            "apt": null,
            "city": "MONTEREY",
            "county": "MONTEREY",
            "state": "CA",
            "zip": "93944",
            "plusFour": "3111",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "12/15/2013",
            "lastDate": "10/04/2014"
          },
          {
            "fullStreet": "443 CHAPLAIN MAGSIG AVE RM 3275",
            "houseNumber": "443",
            "preDirection": null,
            "streetName": "CHAPLAIN MAGSIG",
            "streetType": "AVE",
            "postDirection": null,
            "apt": "3275",
            "city": "MONTEREY",
            "county": "MONTEREY",
            "state": "CA",
            "zip": "93944",
            "plusFour": "3100",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "02/14/2014",
            "lastDate": "02/14/2014"
          },
          {
            "fullStreet": "3609 S CRAYCROFT RD",
            "houseNumber": "3609",
            "preDirection": "S",
            "streetName": "CRAYCROFT",
            "streetType": "RD",
            "postDirection": null,
            "apt": null,
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85707",
            "plusFour": "3511",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "09/17/2014",
            "lastDate": "09/20/2014"
          },
          {
            "fullStreet": "6969 S LADYS THUMB LN",
            "houseNumber": "6969",
            "preDirection": "S",
            "streetName": "LADYS THUMB",
            "streetType": "LN",
            "postDirection": null,
            "apt": null,
            "city": "TUCSON",
            "county": "PIMA",
            "state": "AZ",
            "zip": "85756",
            "plusFour": "5130",
            "phonelist": null,
            "subdivisionName": "VALENCIA RHO",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "09/18/2014",
            "lastDate": "09/18/2014"
          },
          {
            "fullStreet": "161 NUCHOLS ST",
            "houseNumber": "161",
            "preDirection": null,
            "streetName": "NUCHOLS",
            "streetType": "ST",
            "postDirection": null,
            "apt": null,
            "city": "GOODFELLOW AFB",
            "county": "TOM GREEN",
            "state": "TX",
            "zip": "76908",
            "plusFour": "3348",
            "phonelist": null,
            "subdivisionName": null,
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "05/26/2014",
            "lastDate": "05/26/2014"
          },
          {
            "fullStreet": "7204 NW 110TH ST",
            "houseNumber": "7204",
            "preDirection": "NW",
            "streetName": "110TH",
            "streetType": "ST",
            "postDirection": null,
            "apt": null,
            "city": "OKLAHOMA CITY",
            "county": "OKLAHOMA",
            "state": "OK",
            "zip": "73162",
            "plusFour": "2605",
            "phonelist": null,
            "subdivisionName": "WARWICK PLACE III",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "06/01/2012",
            "lastDate": "06/21/2012"
          },
          {
            "fullStreet": "1433 CARISSA CT",
            "houseNumber": "1433",
            "preDirection": null,
            "streetName": "CARISSA",
            "streetType": "CT",
            "postDirection": null,
            "apt": null,
            "city": "CHULA VISTA",
            "county": "SAN DIEGO",
            "state": "CA",
            "zip": "91911",
            "plusFour": "5608",
            "phonelist": null,
            "subdivisionName": "FLAIR",
            "description": null,
            "buildingName": null,
            "countryName": null,
            "distance": null,
            "phones": null,
            "confirmedAddress": null,
            "firstDate": "06/29/2007",
            "lastDate": "06/29/2007"
          }
        ]
      },
      "relatives": {
        "relative": [
          {
            "relationshipType": "Relative",
            "firstName": "COURTNEY",
            "middleName": "C",
            "lastName": "BENNETT",
            "DOB": "00/00/1992",
            "relativeReportToken": "2Ac8IPxjugIY.my_5Ag=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "DANIEL",
            "middleName": "LEO",
            "lastName": "BENNETT",
            "DOB": "00/00/1981",
            "relativeReportToken": "uAU7VPwBvAVs.HvGcqQ=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "JUSTIN",
            "middleName": "M",
            "lastName": "BENNETT",
            "DOB": "00/00/1975",
            "relativeReportToken": "onxSVfwIvQVs.mVmUNg=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "NANCY",
            "middleName": "E",
            "lastName": "BENNETT",
            "DOB": "00/00/1972",
            "relativeReportToken": "p3xeVfxizAVt.BRXX5A=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "TODD",
            "middleName": null,
            "lastName": "BENNETT",
            "DOB": "00/00/1995",
            "relativeReportToken": "1X5cTvwBxA8Y.X9VqOg=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "TODD",
            "middleName": "MATHEW",
            "lastName": "BENNETT",
            "DOB": "00/00/1972",
            "relativeReportToken": "tQ0mT/wS2gUS.skoFkA=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "TRISHA",
            "middleName": "LENEA",
            "lastName": "BENNETT",
            "DOB": "00/00/1966",
            "relativeReportToken": "1XghRvweuQVk.Wp3xZA=="
          },
          {
            "relationshipType": "Relative",
            "firstName": "TYLER",
            "middleName": "ELI",
            "lastName": "BENNETT",
            "DOB": "00/00/1995",
            "relativeReportToken": "1B0sIPwYunQB.i6L0Ow=="
          }
        ]
      },
      "otherPhones": {
        "phone": [
          {
            "phoneNumber": "7028488141",
            "listingName": "TYLER BENNETT",
            "phoneType": "Mobile",
            "carrier": "T-MOBILE USA INC",
            "carrierType": "WIRELESS",
            "city": "LAS VEGAS",
            "state": "NV",
            "county": "CLARK",
            "timeZone": "PT"
          },
          {
            "phoneNumber": "7024884310",
            "listingName": "TYLER BENNETT",
            "phoneType": "Mobile",
            "carrier": "NEW CINGULAR WIRELESS PCS LLC (AT&T MOBILITY)",
            "carrierType": "WIRELESS",
            "city": "LAS VEGAS",
            "state": "NV",
            "county": "CLARK",
            "timeZone": "PT"
          },
          {
            "phoneNumber": "6194827765",
            "listingName": "TYLER BENNETT",
            "phoneType": "LandLine",
            "carrier": "PACIFIC BELL TELEPHONE COMPANY (AT&T CALIFORNIA)",
            "carrierType": "LANDLINE",
            "city": "CHULA VISTA",
            "state": "CA",
            "county": "SAN DIEGO",
            "timeZone": "PT"
          },
          {
            "phoneNumber": "5099645382",
            "listingName": "TYLER BENNETT",
            "phoneType": "Mobile",
            "carrier": "T-MOBILE USA INC",
            "carrierType": "WIRELESS",
            "city": "ELLENSBURG",
            "state": "WA",
            "county": "KITTITAS",
            "timeZone": "PT"
          },
          {
            "phoneNumber": "8015409816",
            "listingName": "TYLER BENNETT",
            "phoneType": "Mobile",
            "carrier": "NEW CINGULAR WIRELESS PCS LLC (AT&T MOBILITY)",
            "carrierType": "WIRELESS",
            "city": "KAYSVILLE",
            "state": "UT",
            "county": "DAVIS",
            "timeZone": "MT"
          }
        ]
      },
      "emails": {
        "email": "tyler.bennett52@yahoo.com"
      },
      "sexOffender": null,
      "bankruptcies": "0",
      "mostRecentBankruptcyDate": null,
      "bankruptcyRecords": "0",
      "mostRecentBankruptcyRecordDate": null,
      "liens": "0",
      "mostRecentLienDate": null,
      "judgements": "0",
      "timesreported": "1",
      "occupation": null,
      "reportToken": "oAooQvxmvwBi.7nTydA==",
      "mostRecentJudgementDate": null,
      "firstDate": null,
      "lastDate": null,
      "reportID": "oAooQvxmvwBi.7nTydA=="
    }
  }
} 