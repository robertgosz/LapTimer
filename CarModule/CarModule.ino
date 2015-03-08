
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"

typedef struct {
  uint16_t car;
  uint16_t send_delay;
  uint16_t retry_count;
  uint16_t message_no;
} msgType;

RF24 radio(9,10);
byte addresses[][6] = {"1Node","2Node"};
msgType message;

uint16_t car_number = 1;
uint8_t max_retry_count = 10;

void setup() {

  Serial.begin(115200);
  printf_begin();
  SPI.setClockDivider(SPI_CLOCK_DIV4);

  // Setup and configure rf radio
  radio.begin();                          
  radio.setAutoAck(1);                    
  radio.setRetries(15,5);                // Max delay between retries & number of retries
  radio.setPayloadSize(sizeof(msgType));
  radio.setChannel(111);
  radio.setPALevel(RF24_PA_LOW);          // RF24_PA_MIN, RF24_PA_LOW, RF24_PA_HIGH, RF24_PA_MAX
  radio.openWritingPipe(addresses[0]);
  radio.openReadingPipe(1,addresses[1]);
  radio.printDetails();                  
  
  message.car = car_number;
  message.message_no = 1;
  
  //printf("Message size: %u \n", sizeof(msgType));
 
}

void loop(void){
    
    randomSeed(analogRead(0));
    unsigned long time_started = micros();
    unsigned long current_time;
    boolean success = false;
    message.retry_count = 1;
    
    while (!success && message.retry_count<max_retry_count+1) {
      current_time = micros();
      message.send_delay = floor((current_time-time_started)/1000);
      if (!radio.write(&message, sizeof(msgType))) {
        printf("Error with %u try \n", message.retry_count);  
        message.retry_count++;
        delay(5+random(1, 15));
      } else {
        success=true;
      }      
    }
    
    if (success) {
      printf("Message sent (msg_no :: try_no :: delay) %u  ::  %u  ::  %u \n", 
        message.message_no, message.retry_count, message.send_delay);  
    } else {
      printf("Transmit failed \n");  
    }

    delay(1250+random(100, 300));
    message.message_no++;
}
