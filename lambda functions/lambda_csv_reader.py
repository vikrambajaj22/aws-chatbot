import boto3

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    obj = s3.get_object(Bucket=bucket, Key=key)
    
    rows = obj['Body'].read().split('\n')
    table = dynamodb.Table('yelp-restaurants-table')
    
    with table.batch_writer() as batch:
        for row in rows:
            try:
                index = row.split(',')[0]
                alias = row.split(',')[1]
                cuisine = row.split(',')[2]
                distance = row.split(',')[3]
                id = row.split(',')[4]
                insertedAtTimestamp = row.split(',')[5]
                location_address1 = row.split(',')[6]
                location_city = row.split(',')[7]
                location_state = row.split(',')[8]
                location_zip_code = row.split(',')[9]
                name = row.split(',')[10]
                price = row.split(',')[11]
                rating = row.split(',')[12]
                review_count = row.split(',')[13]
                if (index=="" or alias=="" or cuisine=="" or distance=="" or id=="" or insertedAtTimestamp=="" or location_address1=="" or location_city=="" or location_state=="" or location_zip_code=="" or name=="" or price=="" or rating=="" or review_count==""):
                    pass
                else:
                    batch.put_item(Item={
                        'index' : index,
                        'alias' : alias,
                        'cuisine' : cuisine,
                        'distance' : distance,
                        'id' : id,
                        'insertedAtTimestamp' : insertedAtTimestamp,
                        'location_address1' : location_address1,
                        'location_city' : location_city,
                        'location_state' : location_state,
                        'location_zip_code': location_zip_code,
                        'name': name,
                        'price': price,
                        'rating': rating,
                        'review_count' : review_count
                })
            except:
                pass
    
